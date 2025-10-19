import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TaskList from "@/components/TaskList";
import TaskModal from "@/components/TaskModal";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "inprogress" | "done";
  dueDate: string;
}

const Tasks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "todo" | "inprogress" | "done">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Welcome to TaskFlow!",
      description: "Click on a task to edit it, or add a new one using the + button",
      status: "todo",
      dueDate: new Date().toISOString().split("T")[0],
    },
  ]);

  const handleLogout = () => {
    localStorage.removeItem("taskflow_user");
    toast({
      title: "Logged out",
      description: "Come back soon!",
    });
    navigate("/login");
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "Task has been removed",
    });
  };

  const handleSaveTask = (taskData: Omit<Task, "id">) => {
    if (editingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id ? { ...taskData, id: editingTask.id } : task
        )
      );
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully",
      });
    } else {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
      };
      setTasks([...tasks, newTask]);
      toast({
        title: "Task created",
        description: "Your new task has been added",
      });
    }
    setIsModalOpen(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">TaskFlow</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Task Header & Filters */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">My Tasks</h2>
          <div className="flex gap-2 flex-wrap">
            {(["all", "todo", "inprogress", "done"] as const).map((filterOption) => (
              <Button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                variant={filter === filterOption ? "default" : "outline"}
                className={
                  filter === filterOption
                    ? "bg-accent hover:bg-accent/90"
                    : ""
                }
              >
                {filterOption === "all"
                  ? "All"
                  : filterOption === "todo"
                  ? "To-Do"
                  : filterOption === "inprogress"
                  ? "In Progress"
                  : "Done"}
              </Button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />

        {/* Floating Action Button */}
        <Button
          onClick={handleAddTask}
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
};

export default Tasks;
