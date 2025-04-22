import { asyncHandler } from "../utils/asyncHandeler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import Todo from "../model/Todo.model.js"
import { isValidObjectId } from "mongoose"

const createTodo = asyncHandler(async (req, res) => {
    const { title, complited, dueDate, priority, tags } = req.body;
    if (!title) {
        return res.status(400).json(new ApiError("Title is required"));
    }
    const newTodo = await Todo.create({ title, complited, dueDate, priority, tags });
    return res.status(201).json(new ApiResponse("Todo created successfully", newTodo));
})

const getTodos = asyncHandler(async (req, res) => {
    const todos = await Todo.find();
    return res.status(200).json(new ApiResponse("Todos retrieved successfully", todos));
});

const updateTodo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json(new ApiError("Invalid ID."));
    }

    const { title, dueDate, completed, priority, tags } = req.body;

    if (title == undefined &&
        dueDate == undefined &&
        completed == undefined &&
        priority == undefined &&
        tags == undefined
    ) {
        return res.status(400).json(new ApiError("At least one field must be provided for update."));
    }

    const updatedData = {};
    if (title !== undefined) updatedData.title = title;
    if (dueDate !== undefined) updatedData.dueDate = dueDate;
    if (completed !== undefined) updatedData.completed = completed;
    if (priority !== undefined) updatedData.priority = priority;
    if (tags !== undefined) updatedData.tags = tags;

    updatedData.updatedAt = new Date();
    const updatedTodo = await Todo.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedTodo) {
        return res.status(404).json(new ApiError("Todo not found."));
    }

    return res.status(200).json(new ApiResponse("Todo updated successfully", updatedTodo));

})

const deleteTodo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json(new ApiError("Invalid ID ."));
    }
    const todo = await Todo.findById(id);
    if (!todo) {
        return res.status(404).json(new ApiError("Todo not found."));
    }
    if (!todo.completed) {
        return res.status(403).json(new ApiError("Cannot delete an incomplete todo."));
    }
    await Todo.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse("Todo deleted Succssfully"));
});

const markAsComplete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json(new ApiError("Invalid ID."));
    }
    const updatedTodo = await Todo.findByIdAndUpdate(id, { completed: true, updatedAt: new Date() }, { new: true });
    if (!updatedTodo) {
        return res.status(404).json(new ApiError("Todo not found."));
    }
    return res.status(200).json(new ApiResponse("Todo marked as complete", updatedTodo));
});

const getTodoBysomeMethods = asyncHandler(async (req, res) => {
    const { priority, tag } = req.query;

    const filter = {};
    if (priority !== undefined) filter.priority = priority;
    if (tag !== undefined) filter.tags = tag;

    const todos = await Todo.find(filter);
    return res.status(200).json(new ApiResponse("Todos retrieved successfully", todos));
});

const getTodoById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json(new ApiError("Invalid ID."));
    }

    const todo = await Todo.findById(id);
    if (!todo) {
        return res.status(404).json(new ApiError("Todo not found."));
    }

    return res.status(200).json(new ApiResponse("Todo fetched successfully", todo));
});

const deleteAllTodo = asyncHandler(async (req, res) => {
    const result = await Todo.deleteMany({
        completed: true
    });
    return res.status(200).json(new ApiResponse("All completed todos deleted successfully", result.deletedCount));
})

const getTodoByDueDate = asyncHandler(async (req, res) => {
    const { before, after } = req.query;

    const filter = {};
    if (before) {
        filter.dueDate = { ...filter.dueDate, $lt: new Date(before) };
    }
    if (after) {
        filter.dueDate = { ...filter.dueDate, $gt: new Date(after) };
    }
    const todos = await Todo.find(filter);
    return res.status(200).json(new ApiResponse("Todos retrieved by due date successfully", todos));
});

const getTodoStats = asyncHandler(async (req, res) => {
    // const totalTodos = await Todo.countDocuments();
    // const completedTodos = await Todo.countDocuments({ completed: true });
    // const pending = await Todo.countDocuments({completed : false})

    /*
    $facet lets us run multiple pipelines in parallel and return all results in one response.
    */

    const stats = await Todo.aggregate([
        {
            $facet: {
                total: [
                    {
                        $count: "count"
                    }
                ],
                completed: [
                    {
                        $match: {
                            completed: true
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                pending: [
                    {
                        $match: {
                            completed: false
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                overdue: [
                    {
                        $match: {
                            dueDate: {
                                $lt: new Date()
                            },
                            completed: false
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                upcomming: [
                    {
                        $match: {
                            dueDate: {
                                $gte: new Date()
                            },
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                byPriority: [
                    {
                        $group: {
                            _id: "$priority",
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $sort: {
                            _id: 1
                        }
                    }
                ],
                byTags: [
                    {
                        $group: {
                            _id: "$tags",
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $sort: {
                            count: -1
                        }
                    }
                ]
            }
        }
    ])

    console.log(stats);

    const data = {
        total: stats[0].total[0]?.count || 0,
        completed: stats[0].completed[0]?.count || 0,
        pending: stats[0].pending[0]?.count || 0,
        overdue: stats[0].overdue[0]?.count || 0,
        upcoming: stats[0].upcomming[0]?.count || 0,
        byPriority: stats[0].byPriority,
        byTags: stats[0].byTags
    };
    console.log(data);
    res.status(200).json(new ApiResponse("Todo Stats are generated successfully .", data))
});;


export {
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
};