import { Task } from "../models/Task";

export const isUserTask = function (userId, text, key) {
    const userT=new Task(userId, text, key);
    return userT.tasksUser;
}

export const isUserTaskAll = function (userId, text, key) {
    const userT=new Task(userId, text, key);
    return userT.tasksUserAll;
}