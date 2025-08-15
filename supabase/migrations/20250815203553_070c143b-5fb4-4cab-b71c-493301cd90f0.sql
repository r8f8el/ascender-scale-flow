
-- Add foreign key constraint to link solicitacoes to client_profiles
ALTER TABLE public.solicitacoes 
ADD CONSTRAINT fk_solicitacoes_solicitante 
FOREIGN KEY (solicitante_id) REFERENCES public.client_profiles(id);

-- Add foreign key constraint for aprovador_atual_id if it should also reference client_profiles
ALTER TABLE public.solicitacoes 
ADD CONSTRAINT fk_solicitacoes_aprovador 
FOREIGN KEY (aprovador_atual_id) REFERENCES public.client_profiles(id);
