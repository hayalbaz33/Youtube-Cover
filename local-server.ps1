$ErrorActionPreference = "Stop"

$Port = 3000
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BufferSize = 65536

$MimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".gif"  = "image/gif"
  ".svg"  = "image/svg+xml"
  ".mp4"  = "video/mp4"
  ".webm" = "video/webm"
  ".mov"  = "video/quicktime"
}

function Get-LocalIPv4 {
  $addresses = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName())
  $address = $addresses |
    Where-Object {
      $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and
      -not $_.IPAddressToString.StartsWith("127.") -and
      (
        $_.IPAddressToString.StartsWith("192.168.") -or
        $_.IPAddressToString.StartsWith("10.") -or
        $_.IPAddressToString -match "^172\.(1[6-9]|2[0-9]|3[0-1])\."
      )
    } |
    Select-Object -First 1

  if ($address) { return $address.IPAddressToString }
  return $null
}

function Write-Headers {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$Reason,
    [hashtable]$Headers
  )

  $builder = [System.Text.StringBuilder]::new()
  [void]$builder.Append("HTTP/1.1 $StatusCode $Reason`r`n")
  foreach ($key in $Headers.Keys) {
    [void]$builder.Append("$key`: $($Headers[$key])`r`n")
  }
  [void]$builder.Append("Connection: close`r`n")
  [void]$builder.Append("`r`n")

  $bytes = [System.Text.Encoding]::ASCII.GetBytes($builder.ToString())
  $Stream.Write($bytes, 0, $bytes.Length)
}

function Send-Text {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [string]$Text,
    [string]$ContentType = "text/plain; charset=utf-8",
    [int]$StatusCode = 200,
    [string]$Reason = "OK"
  )

  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
  Write-Headers -Stream $Stream -StatusCode $StatusCode -Reason $Reason -Headers @{
    "Content-Type" = $ContentType
    "Content-Length" = $bytes.Length
  }
  $Stream.Write($bytes, 0, $bytes.Length)
}

function Resolve-SafePath {
  param([string]$RelativePath)

  $decoded = [System.Uri]::UnescapeDataString($RelativePath).TrimStart("/")
  $decoded = $decoded -replace "/", [System.IO.Path]::DirectorySeparatorChar
  $combined = Join-Path $Root $decoded
  $fullPath = [System.IO.Path]::GetFullPath($combined)
  $rootFullPath = [System.IO.Path]::GetFullPath($Root)

  if (-not $fullPath.StartsWith($rootFullPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }

  return $fullPath
}

function Get-RoutePath {
  param([string]$Path)

  if ($Path -eq "/" -or $Path -eq "/index.html") { return "index.html" }
  if ($Path -eq "/style.css" -or $Path -eq "/styles.css") { return "styles.css" }
  if ($Path -eq "/app.js") { return "app.js" }
  if ($Path.StartsWith("/assets/")) { return $Path }
  if ($Path.StartsWith("/published-thumbnails/")) { return $Path }
  if ($Path.StartsWith("/local-videos/")) { return $Path }
  return $null
}

function Read-Request {
  param([System.Net.Sockets.NetworkStream]$Stream)

  $Stream.ReadTimeout = 5000
  $buffer = New-Object byte[] 8192
  $memory = [System.IO.MemoryStream]::new()

  while ($true) {
    $read = $Stream.Read($buffer, 0, $buffer.Length)
    if ($read -le 0) { break }
    $memory.Write($buffer, 0, $read)
    $text = [System.Text.Encoding]::ASCII.GetString($memory.ToArray())
    if ($text.Contains("`r`n`r`n")) { return $text }
    if ($memory.Length -gt 65536) { return $text }
  }

  return [System.Text.Encoding]::ASCII.GetString($memory.ToArray())
}

function Parse-Request {
  param([string]$RawRequest)

  $lines = $RawRequest -split "`r`n"
  if ($lines.Count -eq 0 -or -not $lines[0]) { return $null }

  $firstParts = $lines[0] -split " "
  if ($firstParts.Count -lt 2) { return $null }

  $headers = @{}
  for ($i = 1; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if (-not $line) { break }
    $colon = $line.IndexOf(":")
    if ($colon -gt 0) {
      $name = $line.Substring(0, $colon).Trim().ToLowerInvariant()
      $value = $line.Substring($colon + 1).Trim()
      $headers[$name] = $value
    }
  }

  $rawPath = ($firstParts[1] -split "\?")[0]
  return @{
    Method = $firstParts[0]
    Path = $rawPath
    Headers = $headers
  }
}

function Send-File {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [hashtable]$Request,
    [string]$Path
  )

  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    Send-Text -Stream $Stream -Text "Not found" -StatusCode 404 -Reason "Not Found"
    return
  }

  $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
  $contentType = $MimeTypes[$extension]
  if (-not $contentType) { $contentType = "application/octet-stream" }

  $fileInfo = [System.IO.FileInfo]::new($Path)
  $fileLength = [int64]$fileInfo.Length
  $rangeHeader = $Request.Headers["range"]
  $isVideo = $extension -in @(".mp4", ".webm", ".mov")

  $start = [int64]0
  $end = [int64]($fileLength - 1)
  $statusCode = 200
  $reason = "OK"
  $headers = @{
    "Content-Type" = $contentType
  }

  if ($isVideo) {
    $headers["Accept-Ranges"] = "bytes"
  }

  if ($isVideo -and $rangeHeader -and $rangeHeader -match "^bytes=(\d*)-(\d*)$") {
    $statusCode = 206
    $reason = "Partial Content"
    $startText = $Matches[1]
    $endText = $Matches[2]

    if ($startText -eq "" -and $endText -ne "") {
      $suffixLength = [int64]$endText
      $start = [Math]::Max([int64]0, $fileLength - $suffixLength)
    } elseif ($startText -ne "") {
      $start = [int64]$startText
    }

    if ($endText -ne "" -and $startText -ne "") {
      $end = [int64]$endText
    }

    if ($start -lt 0 -or $start -ge $fileLength -or $end -lt $start) {
      Write-Headers -Stream $Stream -StatusCode 416 -Reason "Range Not Satisfiable" -Headers @{
        "Content-Range" = "bytes */$fileLength"
        "Content-Length" = 0
      }
      return
    }

    $end = [Math]::Min($end, $fileLength - 1)
    $headers["Content-Range"] = "bytes $start-$end/$fileLength"
  }

  $contentLength = [int64]($end - $start + 1)
  $headers["Content-Length"] = $contentLength
  Write-Headers -Stream $Stream -StatusCode $statusCode -Reason $reason -Headers $headers

  if ($Request.Method -eq "HEAD") { return }

  $fileStream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
  try {
    $fileStream.Position = $start
    $buffer = New-Object byte[] $BufferSize
    $remaining = $contentLength

    while ($remaining -gt 0) {
      $readSize = [int][Math]::Min([int64]$buffer.Length, $remaining)
      $read = $fileStream.Read($buffer, 0, $readSize)
      if ($read -le 0) { break }
      $Stream.Write($buffer, 0, $read)
      $remaining -= $read
    }
  } finally {
    $fileStream.Dispose()
  }
}

$Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
$Listener.Start()

$ip = Get-LocalIPv4
Write-Host ""
Write-Host "HayalHanem Thumbnail & Video Preview local server çalışıyor." -ForegroundColor Green
Write-Host "Local adres: http://localhost:$Port"
if ($ip) {
  Write-Host "Ağ adresi: http://$ip`:$Port"
} else {
  Write-Host "Ağ adresi otomatik bulunamadı. CMD açıp ipconfig yazın, IPv4 Address değerini kullanın." -ForegroundColor Yellow
}
Write-Host "Durdurmak için CTRL+C kullanın."
Write-Host ""

while ($true) {
  $client = $Listener.AcceptTcpClient()

  try {
    $stream = $client.GetStream()
    $rawRequest = Read-Request -Stream $stream
    $request = Parse-Request -RawRequest $rawRequest

    if (-not $request) {
      Send-Text -Stream $stream -Text "Bad request" -StatusCode 400 -Reason "Bad Request"
      continue
    }

    if ($request.Path -eq "/api/health") {
      Send-Text -Stream $stream -Text '{"ok":true,"mode":"local-video-server"}' -ContentType "application/json; charset=utf-8"
      continue
    }

    if ($request.Path -eq "/api/local-videos") {
      $manifestPath = Join-Path $Root "local-videos\manifest.json"
      if (Test-Path -LiteralPath $manifestPath -PathType Leaf) {
        try {
          $manifestText = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8
          $null = $manifestText | ConvertFrom-Json
          Send-Text -Stream $stream -Text $manifestText -ContentType "application/json; charset=utf-8"
        } catch {
          Send-Text -Stream $stream -Text "[]" -ContentType "application/json; charset=utf-8"
        }
      } else {
        Send-Text -Stream $stream -Text "[]" -ContentType "application/json; charset=utf-8"
      }
      continue
    }

    $routePath = Get-RoutePath -Path $request.Path
    if (-not $routePath) {
      Send-Text -Stream $stream -Text "Not found" -StatusCode 404 -Reason "Not Found"
      continue
    }

    $filePath = Resolve-SafePath -RelativePath $routePath
    if (-not $filePath) {
      Send-Text -Stream $stream -Text "Forbidden" -StatusCode 403 -Reason "Forbidden"
      continue
    }

    Send-File -Stream $stream -Request $request -Path $filePath
  } catch {
    try {
      $stream = $client.GetStream()
      Send-Text -Stream $stream -Text "Server error" -StatusCode 500 -Reason "Server Error"
    } catch {}
  } finally {
    $client.Close()
  }
}
