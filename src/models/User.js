import { BaseModel } from "./BaseModel";
import { getFromStorage, addToStorage } from "../utils";

export class User extends BaseModel {
  constructor(login, password, nopass, isAdmin) {
    super();
    this.login = login;
    this.password = password;
    this.isAdmin = isAdmin || false;
    this.storageKey = "users";
    this.nopass = nopass || false;
  }

  //функция проверки авторизации
  get hasAccess() {
    let users = getFromStorage(this.storageKey);
    if (users.length == 0) return false;
    for (let user of users) {
      if ((user.login == this.login && user.password == this.password) || (user.login == this.login && this.nopass===true)){
        this.isAdmin = user.isAdmin;
        this.id = user.id;
        return true;
      }
    }
    return false;
  }

  static save(user) {
    try {
      addToStorage(user, user.storageKey);
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }
}