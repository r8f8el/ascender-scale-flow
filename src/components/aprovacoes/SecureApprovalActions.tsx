
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, Edit, AlertTriangle } from 'lucide-react';
import { useSecureValidation } from '@/hooks/useSecureValidation';
import { useRateLimit } from '@/hooks/useRateLimit';
import { toast } from 'sonner';

interface SecureApprovalActionsProps {
  onApprove: (comments?: string) => Promise<void>;
  onReject: (comments: string) => Promise<void>;
  onRequestAdjustment: (comments: string) => Promise<void>;
  isLoading?: boolean;
  canApprove?: boolean;
}

export const SecureApprovalActions: React.FC<SecureApprovalActionsProps> = ({
  onApprove,
  onReject,
  onRequestAdjustment,
  isLoading = false,
  canApprove = true
}) => {
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'adjust' | null>(null);
  const [comments, setComments] = useState('');
  const [showCommentField, setShowCommentField] = useState(false);

  const { validateForm, errors, sanitizeInput } = useSecureValidation();
  const { checkRateLimit } = useRateLimit();

  if (!canApprove) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Você não tem permissão para aprovar esta solicitação.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleActionClick = (action: 'approve' | 'reject' | 'adjust') => {
    if (action === 'approve') {
      setActionType(action);
      setShowCommentField(true);
    } else {
      setActionType(action);
      setShowCommentField(true);
    }
  };

  const handleSubmitAction = async () => {
    if (!actionType) return;

    // Check rate limit for approval actions
    const allowed = await checkRateLimit({
      action: 'approval_action',
      maxAttempts: 20,
      windowMinutes: 60
    });

    if (!allowed) return;

    // Validate comments for reject and adjust actions
    if ((actionType === 'reject' || actionType === 'adjust') && !comments.trim()) {
      toast.error('Comentários são obrigatórios para esta ação');
      return;
    }

    const sanitizedComments = sanitizeInput(comments);

    // Validate comment length
    const isValid = validateForm(
      { comments: sanitizedComments },
      [
        {
          field: 'comments',
          validator: (value: string) => value.length <= 1000,
          message: 'Comentários devem ter no máximo 1000 caracteres'
        }
      ],
      {
        maxLength: { comments: 1000 },
        sanitize: true
      }
    );

    if (!isValid) return;

    try {
      switch (actionType) {
        case 'approve':
          await onApprove(sanitizedComments || undefined);
          break;
        case 'reject':
          await onReject(sanitizedComments);
          break;
        case 'adjust':
          await onRequestAdjustment(sanitizedComments);
          break;
      }

      // Reset form
      setActionType(null);
      setComments('');
      setShowCommentField(false);

    } catch (error: any) {
      toast.error('Erro ao processar ação: ' + error.message);
    }
  };

  const handleCancel = () => {
    setActionType(null);
    setComments('');
    setShowCommentField(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações de Aprovação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showCommentField ? (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleActionClick('approve')}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Aprovar</span>
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleActionClick('reject')}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Rejeitar</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleActionClick('adjust')}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Solicitar Ajuste</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval-comments">
                Comentários
                {(actionType === 'reject' || actionType === 'adjust') && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Textarea
                id="approval-comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={
                  actionType === 'approve' 
                    ? 'Comentários opcionais sobre a aprovação...'
                    : actionType === 'reject'
                    ? 'Explique os motivos da rejeição...'
                    : 'Descreva os ajustes necessários...'
                }
                rows={4}
                maxLength={1000}
                className={errors.comments ? 'border-destructive' : ''}
              />
              {errors.comments && (
                <p className="text-sm text-destructive mt-1">{errors.comments}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {comments.length}/1000 caracteres
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleSubmitAction}
                disabled={isLoading}
                variant={actionType === 'approve' ? 'default' : actionType === 'reject' ? 'destructive' : 'outline'}
              >
                {isLoading ? 'Processando...' : 
                 actionType === 'approve' ? 'Confirmar Aprovação' :
                 actionType === 'reject' ? 'Confirmar Rejeição' :
                 'Confirmar Solicitação de Ajuste'}
              </Button>
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
