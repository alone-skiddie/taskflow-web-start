import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TaskList from "@/components/TaskList";
import TaskModal from "@/components/TaskModal";
import { supabase } from "@/integrations/supabase/client";

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUserId(session.user.id);
        fetchTasks(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUserId(session.user.id);
        fetchTasks(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchTasks = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform database format to component format
      const transformedTasks: Task[] = (data || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        status: (task.status || "todo") as "todo" | "inprogress" | "done",
        dueDate: task.due_date,
      }));
      
      setTasks(transformedTasks);
    } catch (error: any) {
      toast({
        title: "Error loading tasks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.filter((task) => task.id !== taskId));
      toast({
        title: "Task deleted",
        description: "Task has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveTask = async (taskData: Omit<Task, "id">) => {
    if (!userId) return;

    try {
      if (editingTask) {
        // Update existing task
        const { error } = await supabase
          .from("tasks")
          .update({
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            due_date: taskData.dueDate,
          })
          .eq("id", editingTask.id);

        if (error) throw error;

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
        // Create new task
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            user_id: userId,
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            due_date: taskData.dueDate,
          })
          .select()
          .single();

        if (error) throw error;

        const newTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description || "",
          status: (data.status || "todo") as "todo" | "inprogress" | "done",
          dueDate: data.due_date,
        };
        setTasks([newTask, ...tasks]);
        toast({
          title: "Task created",
          description: "Your new task has been added",
        });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error saving task",
        description: error.message,
        variant: "destructive",
      });
    }
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
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading tasks...
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        )}

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
