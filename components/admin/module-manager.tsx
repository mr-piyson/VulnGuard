"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, ChevronDown, ChevronUp, Pencil, Check, X } from "lucide-react";
import LessonManager from "./lesson-manager";
import { trpc } from "@/lib/trpc/client";

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: any[];
}

interface ModuleManagerProps {
  courseId: string;
  modules: Module[];
}

export default function ModuleManager({ courseId, modules: initialModules }: ModuleManagerProps) {
  const [modules, setModules] = useState(initialModules);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [newModule, setNewModule] = useState({ title: "", description: "" });
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleEditForm, setModuleEditForm] = useState({ title: "", description: "" });
  const utils = trpc.useUtils();

  const createModule = trpc.admin.createModule.useMutation();
  const updateModule = trpc.admin.updateModule.useMutation();
  const deleteModule = trpc.admin.deleteModule.useMutation();

  const handleCreateModule = async () => {
    try {
      const module = await createModule.mutateAsync({
        courseId,
        ...newModule,
        order: modules.length,
      });

      setModules([...modules, { ...(module as any), lessons: [] }]);
      setNewModule({ title: "", description: "" });
      setShowNewForm(false);
      utils.admin.getCourseById.invalidate({ id: courseId });
    } catch (error) {
      console.error("Failed to create module:", error);
    }
  };

  const handleStartModuleEdit = (module: Module) => {
    setEditingModuleId(module.id);
    setModuleEditForm({ title: module.title, description: module.description });
    utils.admin.getCourseById.invalidate({ id: courseId });
  };

  const handleUpdateModule = async () => {
    if (!editingModuleId) return;
    try {
      const updated = await updateModule.mutateAsync({
        id: editingModuleId,
        ...moduleEditForm,
      });
      setModules(modules.map((m) => (m.id === editingModuleId ? { ...m, ...updated } : m)));
      setEditingModuleId(null);
      utils.admin.getCourseById.invalidate({ id: courseId });
    } catch (error) {
      console.error("Failed to update module:", error);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;

    try {
      await deleteModule.mutateAsync({ id: moduleId });
      setModules(modules.filter((m) => m.id !== moduleId));
      utils.admin.getCourseById.invalidate({ id: courseId });
    } catch (error) {
      console.error("Failed to delete module:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Modules</h2>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {showNewForm && (
        <Card className="border-primary/20 bg-muted/50">
          <CardHeader>
            <CardTitle>New Module</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Module Title</Label>
              <Input
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                placeholder="e.g., Introduction to Authentication"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                placeholder="Brief description of this module..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateModule}>Create Module</Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)} className="bg-transparent">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {modules.map((module, index) => (
          <Card key={module.id} className="overflow-hidden">
            <CardHeader className="bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {editingModuleId === module.id ? (
                    <div className="space-y-3 pr-4">
                      <div className="space-y-1">
                        <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">
                          Module Title
                        </Label>
                        <Input
                          value={moduleEditForm.title}
                          onChange={(e) => setModuleEditForm({ ...moduleEditForm, title: e.target.value })}
                          className="font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">
                          Description
                        </Label>
                        <Textarea
                          value={moduleEditForm.description}
                          onChange={(e) => setModuleEditForm({ ...moduleEditForm, description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={handleUpdateModule}>
                          <Check className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingModuleId(null)}
                          className="bg-transparent"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm font-normal tracking-tight">
                          MODULE {index + 1}
                        </span>
                        {module.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">{module.description}</CardDescription>
                    </>
                  )}
                </div>
                <div className="flex gap-1 ml-4 items-start">
                  {!editingModuleId && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleStartModuleEdit(module)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteModule(module.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  >
                    {expandedModule === module.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedModule === module.id && (
              <CardContent className="pt-6 border-t bg-card">
                <LessonManager moduleId={module.id} lessons={module.lessons} />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
