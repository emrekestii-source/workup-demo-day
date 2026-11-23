param([string]$dir, [string]$name)
# Yapistirmaya en yakin durum: var olan bos bir belgeye (Word'un kendi varsayilan stilleriyle) HTML eklenir.
Add-Type -AssemblyName System.Drawing
$w = New-Object -ComObject Word.Application
$w.Visible = $false
$w.DisplayAlerts = 0
try {
  $d = $w.Documents.Add()
  $normal = $d.Styles.Item(-1)
  "Normal stil: $($normal.Font.Name) $($normal.Font.Size)pt, sonra bosluk $($normal.ParagraphFormat.SpaceAfter)pt, satir araligi $($normal.ParagraphFormat.LineSpacing)"
  $d.Content.InsertFile("$dir\$name.html")
  $d.ActiveWindow.View.Type = 3
  $pages = $d.ActiveWindow.Panes.Item(1).Pages
  for ($i = 1; $i -le $pages.Count; $i++) {
    $bits = $pages.Item($i).EnhMetaFileBits
    $ms = New-Object IO.MemoryStream(,[byte[]]$bits)
    $mf = New-Object System.Drawing.Imaging.Metafile($ms)
    $k = 1400 / $mf.Width
    $bmp = New-Object System.Drawing.Bitmap([int]1400, [int]($mf.Height * $k))
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.DrawImage($mf, 0, 0, $bmp.Width, $bmp.Height)
    $bmp.Save("$dir\$name-insert-p$i.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose(); $mf.Dispose(); $ms.Dispose()
    "ok sayfa $i"
  }
  $d.Close(0)
} catch { "HATA: $($_.Exception.Message)" } finally { $w.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($w) }
