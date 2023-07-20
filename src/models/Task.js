import { BaseModel } from "./BaseModel"
import { getFromStorage, addToStorage } from "../utils";

export class Task extends BaseModel {
    constructor(userId, text, key){
        super();
        this.userId = userId;
        this.text = text;
        this.storageKey = key;
    }

    get tasksUser() {
        let tasksforuser = getFromStorage(this.storageKey);
        if (tasksforuser.length == 0) return 'Задачи отсутствуют';
        function isTask(value) {
          if (value.userId == this){
            return value;
          }
        }
        const filtered = tasksforuser.filter(isTask,this.userId);
        if (filtered.length == 0) return 'Задачи отсутствуют';
        return filtered;

    }

    get tasksUserAll() {
      let tasksforuserAll = getFromStorage(this.storageKey);
      if (tasksforuserAll.length == 0) return 'Задачи у всех пользователей отсутствуют';
      return tasksforuserAll;
  }

    static save(task) {
        try {
          addToStorage(task, task.storageKey);
          return true;
        } catch (e) {
          throw new Error(e);
        }
      }

}
