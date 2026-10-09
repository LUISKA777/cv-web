import qrcode

# URL de tu página
url = "https://cv-web-ochre-psi.vercel.app"

# Generar QR
qr = qrcode.make(url)

# Guardar imagen
qr.save("mi_pagina_qr.png")
