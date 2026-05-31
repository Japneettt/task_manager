import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Modal, Button, Form } from "react-bootstrap";

type Card = {
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: string;
  badge?: string | null;
  assigned_to?: string | null;
};

type EditCardModalProps = {
  card: Card | null;
  show: boolean;
  onHide: () => void;
  onSave: (updatedCard: Card) => void;
  members?: any[];
};

const EditCardModal: React.FC<EditCardModalProps> = ({
  card,
  show,
  onHide,
  onSave,
  members = [],
}) => {
  const [formData, setFormData] = useState<Card>({
    id: "",
    title: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (card) {
      setFormData(card);
    }
  }, [card, show]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(`/cards/${formData.id}`, {
        title: formData.title,
        description: formData.description || null,
        due_date: formData.due_date || null,
        priority: formData.priority || "Medium",
        badge: formData.badge || null,
        assigned_to: formData.assigned_to || null,
        position: 0,
      });

      onSave(response.data);
      onHide();
    } catch (err) {
      console.error("Error updating card:", err);
      alert("Failed to update card");
    } finally {
      setLoading(false);
    }
  };

  if (!card) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Card</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* TITLE */}
          <Form.Group className="mb-3">
            <Form.Label>Title *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter card title"
            />
          </Form.Group>

          {/* BADGE */}
          <Form.Group className="mb-3">
            <Form.Label>Badge/Status</Form.Label>
            <Form.Control
              type="text"
              name="badge"
              value={formData.badge || ""}
              onChange={handleInputChange}
              placeholder="e.g., Not Started, On Track, At Risk"
            />
          </Form.Group>

          {/* DESCRIPTION */}
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Enter card description"
            />
          </Form.Group>

          {/* PRIORITY */}
          <Form.Group className="mb-3">
            <Form.Label>Priority</Form.Label>
            <Form.Select
              name="priority"
              value={formData.priority || "Medium"}
              onChange={handleInputChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Form.Select>
          </Form.Group>

          {/* DUE DATE */}
          <Form.Group className="mb-3">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="date"
              name="due_date"
              value={formData.due_date ? formData.due_date.split("T")[0] : ""}
              onChange={handleInputChange}
            />
          </Form.Group>

          {/* ASSIGNED TO */}
          {members && members.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Assign To</Form.Label>
              <Form.Select
                name="assigned_to"
                value={formData.assigned_to || ""}
                onChange={handleInputChange}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.email}>
                    {member.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditCardModal;
