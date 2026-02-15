const { jsPDF } = window.jspdf;

document.querySelector("#fecha").valueAsDate = new Date();

class PDFGenerator {
  constructor() {
    this.doc = new jsPDF({ unit: "px", format: "letter" });
    this.pageWidth = this.doc.internal.pageSize.width;
    // Recuerda renombrar tu archivo a unan_logo.jpg en GitHub
    this.UNAN_LOGO_SRC = "unan_logo.jpg"; 
  }

  async loadUnanLogo() {
    const img = new Image();
    img.src = this.UNAN_LOGO_SRC;
    await img.decode();
    return this.imageToBase64(img);
  }

  imageToBase64(img) {
    const canvas = document.createElement("CANVAS");
    const ctx = canvas.getContext("2d");
    canvas.height = img.naturalHeight;
    canvas.width = img.naturalWidth;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/jpeg");
  }

  getNaturalDate(dateStr) {
    const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const [year, month, day] = dateStr.split("-");
    return `${parseInt(day, 10)} de ${months[parseInt(month, 10) - 1]} de ${year}`;
  }

  writeCenteredText(text, y, style = "normal", size = 12) {
    if (!text) return;
    this.doc.setFont("times", style);
    this.doc.setFontSize(size);
    const textWidth = this.doc.getTextWidth(text);
    const x = (this.pageWidth - textWidth) / 2;
    this.doc.text(text, x, y);
  }

  async generate() {
    let line = 40;
    const date = this.getNaturalDate(document.querySelector("#fecha").value);
    const location = document.querySelector("#lugar").value;
    
    const faculty = document.querySelector("#facultad").value.toUpperCase();
    const career = document.querySelector("#carrera").value.toUpperCase();
    const subject = document.querySelector("#clase").value.toUpperCase();
    const homework = document.querySelector("#tarea").value.split("\n");
    const teacher = document.querySelector("#docente").value;
    const students = document.querySelector("#estudiantes").value.split("\n");

    // 1. Encabezado (Espacio reducido)
    this.writeCenteredText("UNIVERSIDAD NACIONAL AUTÓNOMA DE NICARAGUA, MANAGUA", line, "bold", 14);
    line += 18;
    this.writeCenteredText(faculty, line, "bold", 12);
    line += 16;
    this.writeCenteredText(career, line, "bold", 12);
    line += 25;

    // 2. Logo (Centrado y con espacio controlado)
    try {
        const logoBase64 = await this.loadUnanLogo();
        const logoW = 140; // Tamaño un poco más pequeño para ahorrar espacio
        const logoH = 70;
        this.doc.addImage(logoBase64, "JPEG", (this.pageWidth - logoW) / 2, line, logoW, logoH);
        line += 90; // Salto justo después del logo
    } catch (e) {
        line += 20;
    }

    // 3. Asignatura y Tema
    this.writeCenteredText(subject, line, "bold", 16);
    line += 20;
    homework.forEach((hLine) => {
      this.writeCenteredText(hLine, line, "italic", 14);
      line += 16;
    });

    // 4. Integrantes (Más compacto)
    line += 30;
    this.writeCenteredText("Elaborado por:", line, "bold", 12);
    line += 16;
    students.forEach((s) => {
      this.writeCenteredText(s, line, "normal", 12);
      line += 14;
    });

    // 5. Docente
    line += 20;
    this.writeCenteredText("Docente:", line, "bold", 12);
    line += 16;
    this.writeCenteredText(teacher, line, "normal", 12);

    // 6. Pie de página
    const pageHeight = this.doc.internal.pageSize.height;
    line = pageHeight - 50;
    this.writeCenteredText(location, line, "italic", 11);
    line += 14;
    this.writeCenteredText(date, line, "italic", 11);

    this.doc.save("documento-unan.pdf");
  }
}

document.querySelector("#generarPDF").addEventListener("click", async () => {
  const btn = document.querySelector("#generarPDF");
  const pdfGen = new PDFGenerator();
  try {
    btn.disabled = true;
    btn.innerText = "Generando...";
    await pdfGen.generate();
  } catch (err) {
    alert("Error con el logo. Asegúrate de que el archivo en GitHub se llame unan_logo.jpg sin espacios.");
  } finally {
    btn.disabled = false;
    btn.innerText = "Generar PDF";
  }
});
