
-- Criar trigger para definir automaticamente o ticket_number quando não for fornecido
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger na tabela tickets
DROP TRIGGER IF EXISTS trigger_set_ticket_number ON tickets;
CREATE TRIGGER trigger_set_ticket_number
    BEFORE INSERT OR UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION set_ticket_number();

-- Atualizar as políticas RLS para tickets para garantir que usuários vejam apenas seus próprios tickets
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
CREATE POLICY "Users can view their own tickets" 
    ON tickets FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        user_email = (auth.jwt() ->> 'email')
    );

-- Política para permitir que usuários criem seus próprios tickets
DROP POLICY IF EXISTS "Users can create their own tickets" ON tickets;
CREATE POLICY "Users can create their own tickets" 
    ON tickets FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id OR 
        user_email = (auth.jwt() ->> 'email')
    );

-- Política para permitir que usuários atualizem seus próprios tickets
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;
CREATE POLICY "Users can update their own tickets" 
    ON tickets FOR UPDATE 
    USING (
        auth.uid() = user_id OR 
        user_email = (auth.jwt() ->> 'email')
    );
