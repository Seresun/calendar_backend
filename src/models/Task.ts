import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  date: string; // YYYY-MM-DD
  text: string;
  order: number;
  color?: string;
  completed?: boolean;
}

const TaskSchema = new Schema<ITask>(
  {
    date: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    color: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete (ret as { _id?: unknown })._id;
      },
    },
  },
);

// Индекс для сортировки задач внутри дня
TaskSchema.index({ date: 1, order: 1 });

// Virtual поле id (лучше, чем transform с any)
TaskSchema.virtual('id').get(function () {
  return this._id.toString();
});

export const Task = mongoose.model<ITask>('Task', TaskSchema);
