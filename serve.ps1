$port = 8000
$prefix = "http://localhost:$port/"
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
    $listener.Start()
    Write-Output "Serving $root on $prefix"
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        $localPath = $request.Url.LocalPath.TrimStart('/')
        if ($localPath -eq '') { $localPath = 'recorrido360-tultepec.html' }
        $filePath = Join-Path $root $localPath
        if (Test-Path $filePath) {
            try {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                switch -Regex ($filePath) {
                    '\.html$' { $response.ContentType = 'text/html; charset=utf-8'; break }
                    '\.css$'  { $response.ContentType = 'text/css'; break }
                    '\.js$'   { $response.ContentType = 'application/javascript'; break }
                    '\.jpg$'  { $response.ContentType = 'image/jpeg'; break }
                    '\.jpeg$' { $response.ContentType = 'image/jpeg'; break }
                    '\.png$'  { $response.ContentType = 'image/png'; break }
                    default   { $response.ContentType = 'application/octet-stream'; break }
                }
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes,0,$bytes.Length)
            } catch {
                $response.StatusCode = 500
                $err = [System.Text.Encoding]::UTF8.GetBytes("Server error")
                $response.OutputStream.Write($err,0,$err.Length)
            }
        } else {
            $response.StatusCode = 404
            $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
            $response.ContentLength64 = $body.Length
            $response.OutputStream.Write($body,0,$body.Length)
        }
        $response.Close()
    }
} finally {
    if ($listener -and $listener.IsListening) { $listener.Stop() }
}
