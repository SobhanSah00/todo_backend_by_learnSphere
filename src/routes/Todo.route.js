import { Router } from 'express'
const router = Router();
import {
    createTodo,
    getTodos,
    deleteTodo,
    updateTodo,
    markAsComplete,
    getTodoBysomeMethods,
    getTodoById,
    deleteAllTodo,
    getTodoByDueDate,
    getTodoStats
} from "../controller/Todo.controller.js"

router.route("/createTodo").post(createTodo);
router.route("/getAllTodo").get(getTodos);
router.route("/updateTodo/:id").patch(updateTodo)
router.route("/deleteTodo/:id").delete(deleteTodo);
router.route("/markAsComplete/:id").patch(markAsComplete);
router.route("/getTodoSomeMethods").get(getTodoBysomeMethods)
router.route("/getTodoById/:id").get(getTodoById);
router.route("/deleteAllTodo").delete(deleteAllTodo)
router.route("/getTodoByDueDates").get(getTodoByDueDate)
router.route("/todoStats").get(getTodoStats)

export default router