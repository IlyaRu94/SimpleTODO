export const getFromStorage = function (key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const addToStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};

export const generateTestUser = function (User) {
  localStorage.clear();
  const testUser = new User("admin", "admin1", false, true);
  User.save(testUser);
};
export const generateUser = function (User, login, password, isAdmin) {
  const testUser = new User(login, password, true, isAdmin);

  if (testUser.hasAccess){
    alert('Пользователь уже существует!')
  }else{
    alert("Пользователь " + login + " успешно создан");
    User.save(testUser);
  }
};

export const generateTask = function (Task, userId, text, key) {
  const taskUser = new Task(userId, text, key);
    Task.save(taskUser);
};


    //функция удаления таск и пользователей
export const taskAndUserDelete = function (id, storageKey ) {
      let tasksDelete = getFromStorage(storageKey);
      function isTask(value) {
        if (value.id !== this){
          return value;
        }
      }
      const filtered = tasksDelete.filter(isTask,id);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      return filtered;
  }


  
//функция считывания пользователей из локального хранилища
export const usersInStorage = function (storageKey) {
  let usersIn = getFromStorage(storageKey);
  if (usersIn.length == 0) return false;
  return usersIn;
}