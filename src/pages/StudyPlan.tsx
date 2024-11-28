import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import { plans, tasks } from "../lib/api";
import type { StudyPlan as StudyPlanType, Task } from "../lib/types";
import { toast } from "react-hot-toast";

const planSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["low", "medium", "high"]),
});

export function StudyPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<StudyPlanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const isNewPlan = id === "new";

  const planForm = useForm({
    resolver: zodResolver(planSchema),
  });

  const taskForm = useForm({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (!isNewPlan && id) {
      loadPlan();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadPlan = async () => {
    try {
      const { data } = await plans.get(id!);
      setPlan(data);
    } catch (error) {
      toast.error("Failed to load study plan");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (data: any) => {
    try {
      const { data: newPlan } = await plans.create(data);
      toast.success("Study plan created successfully");
      navigate(`/plans/${newPlan.id}`);
    } catch (error) {
      toast.error("Failed to create study plan");
    }
  };

  const handleCreateTask = async (data: any) => {
    try {
      await tasks.create(id!, data);
      toast.success("Task created successfully");
      setShowNewTask(false);
      taskForm.reset();
      loadPlan();
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await tasks.update(id!, taskId, {
        status: completed ? "completed" : "pending",
      });
      loadPlan();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await tasks.delete(id!, taskId);
      toast.success("Task deleted successfully");
      loadPlan();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isNewPlan) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create New Study Plan
        </h1>
        <form
          onSubmit={planForm.handleSubmit(handleCreatePlan)}
          className="bg-white p-6 rounded-lg shadow"
        >
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                {...planForm.register("title")}
                className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {planForm.formState.errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {planForm.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...planForm.register("description")}
                rows={3}
                className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {planForm.formState.errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {planForm.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                {...planForm.register("startDate")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {planForm.formState.errors.startDate && (
                <p className="mt-1 text-sm text-red-600">
                  {planForm.formState.errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                {...planForm.register("endDate")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {planForm.formState.errors.endDate && (
                <p className="mt-1 text-sm text-red-600">
                  {planForm.formState.errors.endDate.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create Plan
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Plan not found</h3>
        <p className="mt-1 text-gray-500">
          The study plan you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{plan.title}</h1>
        <p className="mt-2 text-gray-600">{plan.description}</p>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            {new Date(plan.startDate).toLocaleDateString()} -{" "}
            {new Date(plan.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
        <button
          onClick={() => setShowNewTask(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </button>
      </div>

      {showNewTask && (
        <form
          onSubmit={taskForm.handleSubmit(handleCreateTask)}
          className="mb-8 bg-white p-6 rounded-lg shadow"
        >
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                {...taskForm.register("title")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {taskForm.formState.errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {taskForm.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...taskForm.register("description")}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {taskForm.formState.errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {taskForm.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                {...taskForm.register("dueDate")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {taskForm.formState.errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">
                  {taskForm.formState.errors.dueDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                {...taskForm.register("priority")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {taskForm.formState.errors.priority && (
                <p className="mt-1 text-sm text-red-600">
                  {taskForm.formState.errors.priority.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewTask(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create Task
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {plan.tasks?.map((task) => (
          <div
            key={task.id}
            className="bg-white p-4 rounded-lg shadow flex items-start justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center">
                <button
                  onClick={() =>
                    handleToggleTask(task.id, task.status === "pending")
                  }
                  className={`mr-3 ${
                    task.status === "completed"
                      ? "text-green-500"
                      : "text-gray-400"
                  }`}
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </button>
                <h3
                  className={`text-lg font-medium ${
                    task.status === "completed"
                      ? "text-gray-500 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {task.title}
                </h3>
              </div>
              <p className="mt-1 text-gray-600">{task.description}</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : task.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="ml-4 p-2 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}

        {(!plan.tasks || plan.tasks.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">No tasks yet</h3>
            <p className="mt-1 text-gray-500">
              Get started by adding a new task.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
