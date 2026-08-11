import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { useToast } from '../../components/Toast';
import { apiPost } from '../../services/api';

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select a category' },
  { value: 'environment', label: 'Environment' },
  { value: 'elderly', label: 'Elderly' },
  { value: 'youth', label: 'Youth' },
  { value: 'animals', label: 'Animals' },
  { value: 'community', label: 'Community' },
  { value: 'health', label: 'Health' },
];

const INITIAL_FORM = {
  title: '',
  description: '',
  category: '',
  date: '',
  start_time: '',
  end_time: '',
  location: '',
  points_awarded: '',
  spots_total: '',
  what_to_bring: '',
  image_url: '',
};

// Duration in hours between two "HH:MM" times (min 0.5, 1 decimal place).
function durationBetween(start, end) {
  const [sh, sm] = (start || '').split(':').map(Number);
  const [eh, em] = (end || '').split(':').map(Number);
  if ([sh, sm, eh, em].some((v) => Number.isNaN(v))) return null;
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max(0.5, Math.round((mins / 60) * 10) / 10);
}

export default function EventCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validate = () => {
    const errs = {};

    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category) errs.category = 'Category is required';

    if (!form.date) {
      errs.date = 'Date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(form.date);
      if (eventDate < today) {
        errs.date = 'Date must be today or in the future';
      }
    }

    if (!form.start_time) errs.start_time = 'Start time is required';
    if (!form.end_time) errs.end_time = 'End time is required';

    if (!form.location.trim()) errs.location = 'Location is required';

    if (!form.spots_total || parseInt(form.spots_total, 10) <= 0) {
      errs.spots_total = 'Spots total must be greater than 0';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      // Map UI field names to the backend contract (event_date/capacity/
      // points_value/duration_hours) — the old payload sent date/start_time/
      // spots_total/points_awarded, which the API never read, so event_date
      // arrived as NULL and creation 500'd on the NOT NULL column.
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        event_date: `${form.date}T${form.start_time}`,
        duration_hours: durationBetween(form.start_time, form.end_time),
        capacity: parseInt(form.spots_total, 10),
        points_value: form.points_awarded ? parseInt(form.points_awarded, 10) : 0,
        image_url: form.image_url || null,
      };
      await apiPost('/organiser/events', payload);
      toast('Event created successfully!', 'success');
      navigate('/organiser/events');
    } catch (err) {
      toast(err.message || 'Failed to create event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Topbar title="Create Event" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">Create New Event</h2>
        </div>

        <div className="card" style={{ maxWidth: 720 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Event title"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-textarea"
                placeholder="Describe your event..."
                rows={4}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.category && <div className="form-error">{errors.category}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
                {errors.date && <div className="form-error">{errors.date}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Points Awarded</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 50"
                  min="0"
                  value={form.points_awarded}
                  onChange={(e) => handleChange('points_awarded', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={form.start_time}
                  onChange={(e) => handleChange('start_time', e.target.value)}
                />
                {errors.start_time && <div className="form-error">{errors.start_time}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={form.end_time}
                  onChange={(e) => handleChange('end_time', e.target.value)}
                />
                {errors.end_time && <div className="form-error">{errors.end_time}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Event location or address"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
              {errors.location && <div className="form-error">{errors.location}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Spots Total *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 100"
                  min="1"
                  value={form.spots_total}
                  onChange={(e) => handleChange('spots_total', e.target.value)}
                />
                {errors.spots_total && <div className="form-error">{errors.spots_total}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com/event.jpg"
                  value={form.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">What to Bring</label>
              <input
                type="text"
                className="form-input"
                placeholder="Comma-separated list, e.g. water bottle, gloves, hat"
                value={form.what_to_bring}
                onChange={(e) => handleChange('what_to_bring', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Event'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/organiser/events')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
