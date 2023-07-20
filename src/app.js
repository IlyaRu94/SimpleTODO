import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import adminAddUser from "./templates/adminAddUser.html";
import dropdownMenu from "./templates/dropdownMenu.html";
import adminMenu from "./templates/adminMenu.html";
import { User } from "./models/User";
import { Task } from "./models/Task";
import { generateTestUser } from "./utils";
import { generateUser } from "./utils";
import { generateTask } from "./utils";
import { taskDelete } from "./utils";
import { State } from "./state";
import { authUser } from "./services/auth";
import { isUserTask } from "./services/taskUser";
import { isUserTaskAll } from "./services/taskUser";
import { logout } from "./services/auth";

export const appState = new State();

const loginForm = document.querySelector("#app-login-form");
const navBar=document.querySelector(".navbar-nav");

generateTestUser(User);

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");


if (authUser(login, password)){
  //Если пользователь является админом - сделаем ему интерфейс админа с доп кнопками и возможностью добавления пользователей, в противном случае обычная Таска
  if(appState.currentUser.isAdmin === true){
    content (taskFieldTemplate);
    alert('Вы вошли как Администратор!');
    navBar.innerHTML = adminMenu;
  }else{
    navBar.innerHTML = '<li class="nav-item"><a class="nav-link active" aria-current="page" href="#" id="home">Мои задачи</a></li>';
    content (taskFieldTemplate);
  }

  //После авторизации, заменяем форму входа на кнопку выхода

  loginForm.innerHTML = '<div class="navbar-brand">' + login + '</div>'+dropdownMenu;
  document.querySelector('.dropdownmenu').addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector('.dropdown-content').classList.toggle('block');
    document.querySelector('.svg').classList.toggle('noblock');
    document.querySelector('.svgout').classList.toggle('block');
  });  
//при клике по кнопке выхода - оповестим пользователя и выкинем его на заглушку
document.querySelector('.logout').addEventListener("click", function (e) {
  e.preventDefault();
  alert('Вы вышли из учетной записи');
logout();
content (noAccessTemplate);
navBar.innerHTML = '';
loginForm.innerHTML = '<input class="form-control me-2" name="login" autocomplete="username" type="text" placeholder="Логин" aria-label="Login"><input class="form-control me-2" name="password" autocomplete="current-password" type="password" placeholder="Пароль" aria-label="Password"><button id="app-login-btn" class="btn btn-outline-info" type="submit">Войти</button>';
});

todoList(appState.currentUser.id);


// логика верхнего меню
navBar.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector(".active").classList.remove("active");
  if (event.target.id === 'addUser') {
    event.target.classList.add('active');
    content (adminAddUser);
  
    //форма добавления нового пользователя
    const adminForm = document.querySelector("#admin-login-form");
    adminForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(adminForm);
      const login = formData.get("login");
      const password = formData.get("password");
      const isAdmin = formData.get("isAdmin")=='1' ? true : false;
      generateUser(User, login, password, isAdmin);//функция добавления пользователя
    });
  }
  if (event.target.id === 'all'){
    event.target.classList.add('active');
    content (taskFieldTemplate);
    //функция, выводящая все записи всех пользователей
    todoList(appState.currentUser.id, true);
  }  
  if (event.target.id === 'home'){
    event.target.classList.add('active');
    content (taskFieldTemplate);
    todoList(appState.currentUser.id);//вывод данных только выбранного пользователя
  }
});



} else {
  content (noAccessTemplate);//вывод контента для неавторизованных
}



});

//функция добавления на страницу данных
function content (add){
  document.querySelector("#content").innerHTML = add;
}




//функция записи задач в блок из локального хранилища
function todoStorage (userId, storagekey, block, All){
  let isStorageTask='';
  if(All){
    isStorageTask= isUserTaskAll(userId, '', storagekey);
  }else{
    isStorageTask= isUserTask(userId, '', storagekey);
    document.querySelector('.'+storagekey+'-tasks').innerHTML= Array.isArray(isStorageTask) ? isStorageTask.length : 0;
  }
  block.innerHTML ='';
  if(Array.isArray(isStorageTask) && isStorageTask.length){
  for (let sTask of isStorageTask) {
    block.innerHTML += ('<li class="dropdown-menu" style="display:flex; padding:10px; position:relative; flex-direction: column;">'+sTask.text+'<span class="itemDel" id="'+sTask.id+'">X</span></li>');
  }
  deleteTask(userId, storagekey, block, All);
  disableButton(storagekey,false);
}else{
  block.innerHTML = ('<li class="dropdown-menu" style="display:flex; padding:10px; position:relative; flex-direction: column;">'+isStorageTask+'</li>');
  disableButton(storagekey,true);
  }
}

//функция записи задач в селекторы из локального хранилища
function todoStorageSel (userId, storagekey, All){
  let isStorageTask= All ? isUserTaskAll(userId, '', storagekey) : isUserTask(userId, '', storagekey);
  let block ='';
  if(Array.isArray(isStorageTask)){
  for (let sTask of isStorageTask) {
    block += ('<option value="'+sTask.id+'">'+sTask.text+'</option>');
  }
return block;
}
}


//функция обработки листа задач
function todoList(userId, All){
    const readyList= document.querySelector("#readyList");
    const progressList= document.querySelector("#progressList");
    const finishList= document.querySelector("#finishList");
    const storageKeyReady = 'ready';
    const storageKeyProgress = 'progress';
    const storageKeyFinish = 'finish';
    todoStorage (userId, storageKeyReady, readyList, All);
    todoStorage (userId, storageKeyProgress, progressList, All);
    todoStorage (userId, storageKeyFinish, finishList, All);
  document.querySelector(".todo").addEventListener('click', (event) => {
  if (event.target.id === 'readyButton') {
    const forInputReady=document.querySelector(".forInputReady");
    forInputReady.innerHTML = '<input type="text" class="form-control" id="readyText"><button class="readySubmit btn btn-outline-primary">ок</button>';
    document.querySelector(".readySubmit").addEventListener('click', (e)=>{
      e.preventDefault();
      let readyText=document.querySelector("#readyText").value;
      forInputReady.innerHTML ='';
      if(readyText){
      generateTask(Task, userId, readyText, storageKeyReady);//white to localstorage
      todoStorage (userId, storageKeyReady, readyList, All);
      }
    });

    }
    if (event.target.id === 'progressButton') {
      
      const forInputProgress=document.querySelector(".forInputProgress");
      forInputProgress.innerHTML = '<select class="form-control" id="progressText">'+todoStorageSel(userId, storageKeyReady, All)+'</select><button class="progressSubmit btn btn-outline-primary">ок</button>';
      document.querySelector(".progressSubmit").addEventListener('click', (e)=>{
        e.preventDefault();
        let progressText=document.querySelector("#progressText");
        forInputProgress.innerHTML ='';
        if(progressText.value){
        generateTask(Task, userId, progressText.options[progressText.selectedIndex].text, storageKeyProgress);//white to localstorage
        todoStorage (userId, storageKeyProgress, progressList, All);
        deleteTask(userId, storageKeyReady, readyList, All, progressText.value);
        }
      });


    }
    if (event.target.id === 'finishButton') {
      
      const forInputFinish=document.querySelector(".forInputFinish");
      forInputFinish.innerHTML = '<select class="form-control" id="finishText">'+todoStorageSel(userId, storageKeyProgress, All)+'</select><button class="finishSubmit btn btn-outline-primary">ок</button>';
      document.querySelector(".finishSubmit").addEventListener('click', (e)=>{
        e.preventDefault();
        let finishText=document.querySelector("#finishText");
        forInputFinish.innerHTML ='';
        if(finishText.value){
        generateTask(Task, userId, finishText.options[finishText.selectedIndex].text, storageKeyFinish);//white to localstorage
        todoStorage (userId, storageKeyFinish, finishList, All);
        deleteTask(userId, storageKeyProgress, progressList, All, finishText.value);
        }
      });

    }
  })

  
  


}

function disableButton(button,disabled){
  switch (button) {
    case 'ready':
      document.getElementById("progressButton").disabled = disabled;
      break;
    case 'progress':
      document.getElementById("finishButton").disabled = disabled;
      break;
  }
}

function deleteTask(userId, storagekey, block, All, delforselectid){

//функция удаления задач при добавлении в другой список
if(delforselectid){
  taskDelete(delforselectid,storagekey);
  todoStorage (userId, storagekey, block, All);
}else{

//функция удаления задач
  const taskItems = document.querySelectorAll('.itemDel');
  let delId='';
  taskItems.forEach(taskItem => {
    taskItem.addEventListener('click', function handleClick(event) {
      delId=event.target.id;
      taskDelete(delId,storagekey);
      todoStorage (userId, storagekey, block, All)
    });
});
}

}