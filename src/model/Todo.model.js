import mongoose, { Schema } from "mongoose";

const TodoSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            unique: true,
            maxLength: [100, "Title must be at most 100 characters"],
            validate: {
                validator: (value) => value.length > 0,
                message: "Title must not be empty"
            }
        },
        completed: {
            type: Boolean,
            default: false
        },
        dueDate: {
            type: Date,
            default: null
        },
        priority: {
            type: Number,
            default: 1,
            min: [1, "Priority must be at least 1"],
            max: [5, "Priority must be at most 5"]
        },
        tags: {
            type: [String],
            enum: {
                values: ["work", "personal", "urgent"],
                message: "{VALUE} is not a valid tag"
            },
            default: ["personal"]
        }
    },
    {
        timestamps: true
    }
);

const Todo = mongoose.model("Todo", TodoSchema);
export default Todo;
