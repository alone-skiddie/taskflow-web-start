import { Task } from "@/pages/Tasks";
import { Calendar, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          You have no tasks yet. Add one to get started!
        </p>
      </div>
    );
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "bg-destructive";
      case "inprogress":
        return "bg-warning";
      case "done":
        return "bg-success";
      default:
        return "bg-muted";
    }
  };

  const getStatusLabel = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "To-Do";
      case "inprogress":
        return "In Progress";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className={`p-4 transition-all hover:shadow-md ${
            task.status === "done" ? "opacity-75" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}
                  title={getStatusLabel(task.status)}
                />
                <h3
                  className={`text-lg font-medium ${
                    task.status === "done" ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </h3>
              </div>
              {task.description && (
                <p className="text-muted-foreground mb-3">{task.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Due: {formatDate(task.dueDate)}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => onEdit(task)}
                variant="outline"
                size="icon"
                className="h-9 w-9"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => onDelete(task.id)}
                variant="outline"
                size="icon"
                className="h-9 w-9 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TaskList;
