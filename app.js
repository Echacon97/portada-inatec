const { jsPDF } = window.jspdf;

// Establece la fecha actual en el campo de fecha del formulario
document.querySelector("#fecha").valueAsDate = new Date();

/**
 * Clase PDFGenerator
 */
class PDFGenerator {
  constructor() {
    this.doc = new jsPDF({ unit: "px", format: "letter" });
    this.pageWidth = this.doc.internal.pageSize.width;
    // Nombre del archivo corregido sin espacios
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
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];
    const [year, month, day] = dateStr.split("-");
    return `${parseInt(day, 10)} de ${months[parseInt(month, 10) - 1]} de ${year}`;
  }

  writeCenteredText(text, y) {
    if (!text) return;
    const textWidth = this.doc.getTextWidth(text);
    const x = (this.pageWidth - textWidth) / 2;
    this.doc.text(text, x, y);
  }

  async generate() {
    let line = 40;
    const date = this.getNaturalDate(document.querySelector("#fecha").value);
    const location = document.querySelector("#lugar").value;
    
    // IDs basados en el script de la UNI
    const faculty = document.querySelector("#facultad").value.toUpperCase();
    const career = document.querySelector("#carrera").value.toUpperCase();
    const subject = document.querySelector("#clase").value.toUpperCase();
    const homework = document.querySelector("#tarea").value.split("\n");
    const teacher = document.querySelector("#docente").value;
    const students = document.querySelector("#estudiantes").value.split("\n");

    this.doc.setFont("times", "bold");
    this.doc.setFontSize(16);
    this.writeCenteredText("UNIVERSIDAD NACIONAL AUTÓNOMA DE NICARAGUA, MANAGUA", line);
    line += 20;
    this.writeCenteredText(faculty, line);
    line += 20;
    this.writeCenteredText(career, line);
    line += 30;

    // Cargar logo corregido
    const logoBase64 = await this.loadUnanLogo();
    this.doc.addImage(logoBase64, "JPEG", (this.pageWidth - 180) / 2, line, 180, 90);
    line = 260;

    this.doc.setFontSize(18);
    this.writeCenteredText(subject, line);
    this.doc.setFont("times", "italic");
    line += 20;
    homework.forEach((hLine) => {
      this.writeCenteredText(hLine, line);
      line += 16;
    });
    line += 40;

    this.doc.setFont("times", "bold");
    this.doc.setFontSize(12);
    this.writeCenteredText("Elaborado por:", line);
    line += 20;
    this.doc.setFont("times", "normal");
    students.forEach((s) => {
      this.writeCenteredText(s, line);
      line += 16;
    });
    line += 20;

    this.doc.setFont("times", "bold");
    this.writeCenteredText("Docente:", line);
    line += 20;
    this.doc.setFont("times", "normal");
    this.writeCenteredText(teacher, line);

    line = 540;
    this.doc.setFont("times", "italic");
    this.writeCenteredText(location, line);
    line += 16;
    this.writeCenteredText(date, line);

    this.doc.save("documento-unan.pdf");
  }
}

document.querySelector("#generarPDF").addEventListener("click", async () => {
  const pdfGen = new PDFGenerator();
  try {
    await pdfGen.generate();
  } catch (err) {
    alert("Hubo un error al generar el PDF. Revisa que el logo se llame unan_logo.jpg y esté en la misma carpeta.");
  }
});
