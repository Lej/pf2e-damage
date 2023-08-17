function getAndResetOutputElement() {
  const outputRow = document.getElementById("output-row");
  if (!!outputRow) {
    outputRow.remove();
  }

  const col = document.createElement("div");
  col.setAttribute("class", "col");

  const row = document.createElement("div");
  row.setAttribute("class", "row");
  row.setAttribute("id", "output-row");
  row.appendChild(col);

  const container = document.getElementById("output");
  container.appendChild(row);

  return col;
}

function escapeHtml(html){
  var text = document.createTextNode(html);
  var p = document.createElement("p");
  p.appendChild(text);
  return p.innerHTML;
}

export function setError(text) {
  const output = getAndResetOutputElement();
  const pre = document.createElement("pre");
  pre.innerText = text;
  pre.className = "mb-0";
  const div = document.createElement("div");
  div.className = "alert alert-danger";
  div.appendChild(pre);
  //output.innerHTML = escapeHtml(text);
  output.appendChild(div);
}

export function setGraph(graph) {
  const output = getAndResetOutputElement();
  output.appendChild(graph);
}