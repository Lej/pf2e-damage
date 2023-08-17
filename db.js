import { constants } from "./constants.js";

function initDb() {

  // Init DB
  let db = getDb();
  if (!db) {
    db = {
      files: {}
    };
  }

  // Init files
  let count = 0;
  for (const name in db.files) {
    count++;
    break;
  }
  if (count === 0) {
    addFile(db);
  }

  setDb(db);
}

function getDb() {
  return JSON.parse(localStorage.getItem("db"));
}

function setDb(db) {
  localStorage.setItem("db", JSON.stringify(db));
}

function createLi(name, isActive) {

  const container = document.createElement("div");
  container.className = "d-flex align-items-baseline nav-link";
  if (isActive) {
    container.className += " active";
  }

  const a = document.createElement("a");
  a.innerText = name;
  a.href = getFileUrl(name);
  container.appendChild(a);

  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "🗙";
  deleteBtn.className = "btn ms-1 p-0";
  deleteBtn.onclick = () => {
    if (confirm(`Delete ${name}?`) !== true) {
      return;
    }
    const db = getDb();
    delete db.files[name];
    setDb(db);
    if (isActive) {
      navigateTo("index.html");
    } else {
      updateFileNavivation(db);
    }
  }
  container.appendChild(deleteBtn);

  const li = document.createElement("li");
  li.className = "nav-item";
  li.appendChild(container);
  return li;
}

function getCurrentFileName() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  return params.id;
}

function getFileUrl(name) {
  return "index.html?id=" + encodeURIComponent(name);
}

function navigateToFile(name) {
  const url = getFileUrl(name);
  navigateTo(url);
}

function navigateTo(url) {
  const a = document.createElement("a");
  a.href = url;
  a.click();
}

function addFile(db) {
  const name = Date.now().toString();
  const content = JSON.parse(JSON.stringify(constants.defaultInput));
  content.name = name;
  db.files[name] = content;
  return name;
}

function updateFileNavivation(db) {

  const ul = document.createElement("ul");
  ul.className = "nav nav-tabs";

  const currentName = getCurrentFileName();
  for (const name in db.files) {
    const file = db.files[name];
    const isActive = file.name === currentName;
    const li = createLi(file.name, isActive);
    ul.appendChild(li);
  }

  const add = document.createElement("li");
  add.innerText = "+";
  add.className = "nav-item nav-link";
  add.role = "button";
  add.onclick = () => {
    const db = getDb();
    const name = addFile(db);
    setDb(db);
    navigateToFile(name);
  };
  ul.appendChild(add);

  const filesElement = document.getElementById("files");
  filesElement.replaceChildren(ul);
}

export function init() {
  initDb();
  const db = getDb();
  const currentName = getCurrentFileName();
  const content = db.files[currentName];
  if (!content) {
    for (const name in db.files) {
      navigateToFile(name);
      throw new Error("Not possible to reach.");
    }
  }
  updateFileNavivation(db);
  document.getElementById("input").value = JSON.stringify(content, undefined, 4);
}

export function save(content) {
  const name = content.name;
  if (!name || !(name.length > 0)) {
    throw new Error("Save failed: Name not specified.");
  }

  const db = getDb();
  db.files[name] = content;
  setDb(db);

  const currentName = getCurrentFileName();
  if (currentName !== name) {
    navigateToFile(name);
  }
}