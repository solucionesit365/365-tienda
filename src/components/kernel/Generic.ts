export function searchByName() {
  const input = document.getElementById("buscador") as HTMLInputElement;
  if (!input) return;

  const filter = input.value.toUpperCase().trim();
  const table = document.querySelector(".cuadrantes-table") as HTMLTableElement;
  if (!table) return;

  const tbody = table.querySelector("tbody");
  if (!tbody) return;

  const rows = tbody.getElementsByTagName("tr");

  // Si no hay filtro, mostrar todas las filas
  if (!filter) {
    for (let i = 0; i < rows.length; i++) {
      rows[i].style.display = "";
    }
    return;
  }

  for (let i = 0; i < rows.length; i++) {
    const nombreCell = rows[i].querySelector(".col-nombre .empleado-nombre") as HTMLElement;

    if (nombreCell) {
      const txtValue = (nombreCell.textContent || nombreCell.innerText).toUpperCase();

      // Búsqueda más flexible: busca si el filtro está contenido en el nombre
      if (txtValue.includes(filter)) {
        rows[i].style.display = "";
      } else {
        rows[i].style.display = "none";
      }
    }
  }
}
