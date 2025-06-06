import router from "@/router";

export function searchByName() {
  let td, i, txtValue;
  const input: any = document.getElementById("buscador");
  const filter: any = input.value.toUpperCase();
  const table: any = document.getElementById("tabla");
  const tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

export function goTo(url: string) {
  router.push(url);
}
