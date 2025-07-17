
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status_id: string;
  priority_id: string;
  category_id: string;
  assigned_to: string | null;
  user_name: string;
  user_email: string;
  user_phone: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
}

interface TicketStatus {
  id: string;
  name: string;
  color: string;
  is_closed: boolean;
}

interface TicketPriority {
  id: string;
  name: string;
  color: string;
  level: number;
}

interface TicketCategory {
  id: string;
  name: string;
  description: string;
}

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const useTicketData = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load tickets with joins
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_statuses:status_id(name, color, is_closed),
          ticket_priorities:priority_id(name, color, level),
          ticket_categories:category_id(name, description),
          admin_profiles:assigned_to(name, email)
        `)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Load statuses
      const { data: statusesData, error: statusesError } = await supabase
        .from('ticket_statuses')
        .select('*')
        .order('name');

      if (statusesError) throw statusesError;

      // Load priorities
      const { data: prioritiesData, error: prioritiesError } = await supabase
        .from('ticket_priorities')
        .select('*')
        .order('level');

      if (prioritiesError) throw prioritiesError;

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('ticket_categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Load admin profiles
      const { data: adminsData, error: adminsError } = await supabase
        .from('admin_profiles')
        .select('*')
        .order('name');

      if (adminsError) throw adminsError;

      setTickets(ticketsData || []);
      setStatuses(statusesData || []);
      setPriorities(prioritiesData || []);
      setCategories(categoriesData || []);
      setAdmins(adminsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    tickets,
    statuses,
    priorities,
    categories,
    admins,
    loading,
    setTickets,
    loadData
  };
};
