import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  MessageSquare,
  Star,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { EmergencyContact } from '../../types';

interface ContactsScreenProps {
  contacts: EmergencyContact[];
  onUpdateContacts: (contacts: EmergencyContact[]) => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({
  contacts,
  onUpdateContacts,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    relationship: 'Family',
    phone: '',
    email: '',
    priority: 2,
    isPrimary: false,
    notifySms: true,
    notifyCall: true,
  });

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;

    const contact: EmergencyContact = {
      id: `c-${Date.now()}`,
      name: newContact.name,
      relationship: newContact.relationship || 'Family',
      phone: newContact.phone,
      email: newContact.email || '',
      priority: (contacts.length + 1) as 1 | 2 | 3,
      isPrimary: contacts.length === 0,
      notifySms: true,
      notifyCall: true,
      status: 'idle',
    };

    onUpdateContacts([...contacts, contact]);
    setIsAdding(false);
    setNewContact({ name: '', relationship: 'Family', phone: '', email: '' });
  };

  const handleDelete = (id: string) => {
    onUpdateContacts(contacts.filter((c) => c.id !== id));
  };

  const handleTestBroadcast = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24 md:pb-12">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" />
            Emergency Contacts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            People notified immediately when you trigger an emergency SOS alert.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition touch-target"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Test Broadcast Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Test Alert Readiness</h4>
            <p className="text-xs text-slate-500">
              Send a test SMS to verify all contacts receive emergency notifications.
            </p>
          </div>
        </div>
        <button
          onClick={handleTestBroadcast}
          disabled={testSent}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition shrink-0 ${
            testSent
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {testSent ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Test SMS Sent!</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send Test SMS</span>
            </>
          )}
        </button>
      </div>

      {/* Contacts List */}
      <div className="space-y-3">
        {contacts.map((contact, index) => (
          <div
            key={contact.id}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              {/* Priority badge */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                  index === 0
                    ? 'bg-sky-100 text-sky-800 border border-sky-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                #{index + 1}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{contact.name}</h3>
                  {index === 0 && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-medium text-slate-700">{contact.relationship}</span>
                  <span>·</span>
                  <span className="font-mono">{contact.phone}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"
                aria-label={`Call ${contact.name}`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
              <a
                href={`sms:${contact.phone}`}
                className="flex items-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"
                aria-label={`Message ${contact.name}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>SMS</span>
              </a>
              <button
                onClick={() => handleDelete(contact.id)}
                className="p-2 text-slate-400 hover:text-alert-600 rounded-xl hover:bg-alert-50 transition"
                title="Delete Contact"
                aria-label={`Delete ${contact.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Emergency Contact</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Doe"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Relationship
                </label>
                <select
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                >
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Physician / Doctor">Physician / Doctor</option>
                  <option value="Friend">Friend / Neighbor</option>
                  <option value="Caregiver">Caregiver</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98200 00000"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="contact@example.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
