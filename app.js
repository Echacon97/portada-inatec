const { jsPDF } = window.jspdf;

// Establecer fecha actual por defecto
document.querySelector("#fecha").valueAsDate = new Date();

class PDFGenerator {
  constructor() {
    // Formato carta (letter) en unidades de píxeles
    this.doc = new jsPDF({ unit: "px", format: "letter" });
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.LOGO_SRC = "unan logo.jpg"; 
  }

  /**
   * Carga la imagen y la prepara para el PDF
   */
  async loadLogo() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = this.LOGO_SRC;
      img.onload = () => resolve(this.imageToBase64(img));
      img.onerror = (err) => reject("Error al cargar el logo: " + err);
    });
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
    let line = 45;
    
    // Obtener valores de los inputs
    const date = this.getNaturalDate(document.querySelector("#fecha").value);
    const location = document.querySelector("#lugar").value;
    const faculty = document.querySelector("#centro").value.toUpperCase();
    const career = document.querySelector("#carrera").value.toUpperCase();
    const subject = document.querySelector("#modulo").value.toUpperCase();
    const homework = document.querySelector("#tarea").value.split("\n");
    const teacher = document.querySelector("#docente").value;
    const students = document.querySelector("#estudiantes").value.split("\n");

    // 1. Encabezado Institucional
    this.writeCenteredText("UNIVERSIDAD NACIONAL AUTÓNOMA DE NICARAGUA, MANAGUA", line, "bold", 15);
    line += 18;
    this.writeCenteredText("UNAN-MANAGUA", line, "bold", 15);
    line += 25;
    this.writeCenteredText(faculty, line, "bold", 13);
    line += 18;
    this.writeCenteredText(career, line, "bold", 13);
    
    // 2. Logo (Centrado y ajustado)
    try {
        const logoBase64 = await this.loadLogo();
        const logoW = 180;
        const logoH = 90;
        this.doc.addImage(logoBase64, "JPEG", (this.pageWidth - logoW) / 2, line + 15, logoW, logoH);
    } catch (e) {
        console.error(e);
    }
    
    line = 240;

    // 3. Información del Componente
    this.writeCenteredText("Asignatura:", line, "bold", 12);
    line += 15;
    this.writeCenteredText(subject, line, "normal", 12);
    
    line += 30;
    this.writeCenteredText("Tema:", line, "bold", 14);
    line += 18;
    homework.forEach((t) => {
      this.writeCenteredText(t, line, "italic", 13);
      line += 16;
    });

    // 4. Integrantes y Docente
    line += 35;
    this.writeCenteredText("Elaborado por:", line, "bold", 12);
    line += 15;
    students.forEach((s) => {
      this.writeCenteredText(s, line, "normal", 12);
      line += 14;
    });

    line += 25;
    this.writeCenteredText("Docente:", line, "bold", 12);
    line += 15;
    this.writeCenteredText(teacher, line, "normal", 12);

    // 5. Pie de página
    line = this.pageHeight - 60;
    this.writeCenteredText(location, line, "normal", 12);
    line += 15;
    this.writeCenteredText(date, line, "normal", 12);

    // Guardar el archivo
    this.doc.save(`Portada_UNAN_${career.slice(0, 15)}.pdf`);
  }
}

// Evento del botón
document.querySelector("#generarPDF").addEventListener("click", async () => {
  const btn = document.querySelector("#generarPDF");
  const originalText = btn.innerText;
  
  try {
      btn.disabled = true;
      btn.innerText = "Generando PDF...";
      const pdfGen = new PDFGenerator();
      await pdfGen.generate();
  } catch (err) {
      alert("Hubo un error al generar el PDF. Revisa que el logo esté en la misma carpeta.");
  } finally {
      btn.disabled = false;
      btn.innerText = originalText;
  }
});
