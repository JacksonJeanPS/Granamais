export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_balance_history: {
        Row: {
          account_id: string
          atualizado_em: string
          criado_em: string
          data_registro: string
          id: string
          observacao: string | null
          origem: string
          saldo: number
          user_id: string
        }
        Insert: {
          account_id: string
          atualizado_em?: string
          criado_em?: string
          data_registro?: string
          id?: string
          observacao?: string | null
          origem: string
          saldo: number
          user_id: string
        }
        Update: {
          account_id?: string
          atualizado_em?: string
          criado_em?: string
          data_registro?: string
          id?: string
          observacao?: string | null
          origem?: string
          saldo?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_balance_history_account_id_user_id_fkey"
            columns: ["account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      accounts: {
        Row: {
          ativa: boolean
          atualizado_em: string
          cor: string
          criado_em: string
          icone: string
          id: string
          inclui_no_patrimonio: boolean
          instituicao: string
          nome: string
          saldo_atual: number
          saldo_inicial: number
          tipo: Database["public"]["Enums"]["account_type"]
          user_id: string
        }
        Insert: {
          ativa?: boolean
          atualizado_em?: string
          cor?: string
          criado_em?: string
          icone?: string
          id?: string
          inclui_no_patrimonio?: boolean
          instituicao: string
          nome: string
          saldo_atual?: number
          saldo_inicial?: number
          tipo: Database["public"]["Enums"]["account_type"]
          user_id: string
        }
        Update: {
          ativa?: boolean
          atualizado_em?: string
          cor?: string
          criado_em?: string
          icone?: string
          id?: string
          inclui_no_patrimonio?: boolean
          instituicao?: string
          nome?: string
          saldo_atual?: number
          saldo_inicial?: number
          tipo?: Database["public"]["Enums"]["account_type"]
          user_id?: string
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          acao: string
          criado_em: string
          entidade: string
          entidade_id: string | null
          id: string
          metadados: Json
          user_id: string
        }
        Insert: {
          acao: string
          criado_em?: string
          entidade: string
          entidade_id?: string | null
          id?: string
          metadados?: Json
          user_id: string
        }
        Update: {
          acao?: string
          criado_em?: string
          entidade?: string
          entidade_id?: string | null
          id?: string
          metadados?: Json
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          atualizado_em: string
          category_id: string
          criado_em: string
          id: string
          mes_referencia: string
          observacao: string | null
          user_id: string
          valor_planejado: number
        }
        Insert: {
          atualizado_em?: string
          category_id: string
          criado_em?: string
          id?: string
          mes_referencia: string
          observacao?: string | null
          user_id: string
          valor_planejado: number
        }
        Update: {
          atualizado_em?: string
          category_id?: string
          criado_em?: string
          id?: string
          mes_referencia?: string
          observacao?: string | null
          user_id?: string
          valor_planejado?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      card_invoices: {
        Row: {
          atualizado_em: string
          card_id: string
          criado_em: string
          data_fechamento: string
          data_vencimento: string
          id: string
          mes_referencia: string
          paga_em: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          user_id: string
          valor_pago: number
          valor_total: number
        }
        Insert: {
          atualizado_em?: string
          card_id: string
          criado_em?: string
          data_fechamento: string
          data_vencimento: string
          id?: string
          mes_referencia: string
          paga_em?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          user_id: string
          valor_pago?: number
          valor_total?: number
        }
        Update: {
          atualizado_em?: string
          card_id?: string
          criado_em?: string
          data_fechamento?: string
          data_vencimento?: string
          id?: string
          mes_referencia?: string
          paga_em?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          user_id?: string
          valor_pago?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_invoices_card_id_user_id_fkey"
            columns: ["card_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      cards: {
        Row: {
          account_id: string | null
          ativo: boolean
          atualizado_em: string
          bandeira: string
          cor: string
          criado_em: string
          dia_fechamento: number
          dia_vencimento: number
          icone: string
          id: string
          instituicao: string
          limite_total: number
          nome: string
          ultimos_quatro_digitos: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          ativo?: boolean
          atualizado_em?: string
          bandeira: string
          cor?: string
          criado_em?: string
          dia_fechamento: number
          dia_vencimento: number
          icone?: string
          id?: string
          instituicao: string
          limite_total: number
          nome: string
          ultimos_quatro_digitos?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          ativo?: boolean
          atualizado_em?: string
          bandeira?: string
          cor?: string
          criado_em?: string
          dia_fechamento?: number
          dia_vencimento?: number
          icone?: string
          id?: string
          instituicao?: string
          limite_total?: number
          nome?: string
          ultimos_quatro_digitos?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_user_id_fkey"
            columns: ["account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      categories: {
        Row: {
          ativa: boolean
          atualizado_em: string
          categoria_pai_id: string | null
          cor: string
          criado_em: string
          icone: string
          id: string
          nome: string
          ordem: number
          padrao_sistema: boolean
          tipo: Database["public"]["Enums"]["category_type"]
          user_id: string
        }
        Insert: {
          ativa?: boolean
          atualizado_em?: string
          categoria_pai_id?: string | null
          cor: string
          criado_em?: string
          icone: string
          id?: string
          nome: string
          ordem?: number
          padrao_sistema?: boolean
          tipo: Database["public"]["Enums"]["category_type"]
          user_id: string
        }
        Update: {
          ativa?: boolean
          atualizado_em?: string
          categoria_pai_id?: string | null
          cor?: string
          criado_em?: string
          icone?: string
          id?: string
          nome?: string
          ordem?: number
          padrao_sistema?: boolean
          tipo?: Database["public"]["Enums"]["category_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_categoria_pai_id_user_id_fkey"
            columns: ["categoria_pai_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      financial_events: {
        Row: {
          atualizado_em: string
          criado_em: string
          data_prevista: string
          id: string
          nome: string
          observacao: string | null
          recorrencia_anual: boolean
          tipo: Database["public"]["Enums"]["financial_event_type"]
          user_id: string
          valor_estimado: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          data_prevista: string
          id?: string
          nome: string
          observacao?: string | null
          recorrencia_anual?: boolean
          tipo: Database["public"]["Enums"]["financial_event_type"]
          user_id: string
          valor_estimado: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          data_prevista?: string
          id?: string
          nome?: string
          observacao?: string | null
          recorrencia_anual?: boolean
          tipo?: Database["public"]["Enums"]["financial_event_type"]
          user_id?: string
          valor_estimado?: number
        }
        Relationships: []
      }
      goal_contributions: {
        Row: {
          account_id: string | null
          atualizado_em: string
          criado_em: string
          data: string
          goal_id: string
          id: string
          observacao: string | null
          tipo: Database["public"]["Enums"]["goal_movement_type"]
          user_id: string
          valor: number
        }
        Insert: {
          account_id?: string | null
          atualizado_em?: string
          criado_em?: string
          data?: string
          goal_id: string
          id?: string
          observacao?: string | null
          tipo: Database["public"]["Enums"]["goal_movement_type"]
          user_id: string
          valor: number
        }
        Update: {
          account_id?: string | null
          atualizado_em?: string
          criado_em?: string
          data?: string
          goal_id?: string
          id?: string
          observacao?: string | null
          tipo?: Database["public"]["Enums"]["goal_movement_type"]
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_account_id_user_id_fkey"
            columns: ["account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "goal_contributions_goal_id_user_id_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      goals: {
        Row: {
          atualizado_em: string
          cor: string
          criado_em: string
          data_alvo: string
          data_inicio: string
          descricao: string | null
          icone: string
          id: string
          nome: string
          status: Database["public"]["Enums"]["goal_status"]
          user_id: string
          valor_alvo: number
          valor_atual: number
          valor_inicial: number
        }
        Insert: {
          atualizado_em?: string
          cor?: string
          criado_em?: string
          data_alvo: string
          data_inicio?: string
          descricao?: string | null
          icone?: string
          id?: string
          nome: string
          status?: Database["public"]["Enums"]["goal_status"]
          user_id: string
          valor_alvo: number
          valor_atual?: number
          valor_inicial?: number
        }
        Update: {
          atualizado_em?: string
          cor?: string
          criado_em?: string
          data_alvo?: string
          data_inicio?: string
          descricao?: string | null
          icone?: string
          id?: string
          nome?: string
          status?: Database["public"]["Enums"]["goal_status"]
          user_id?: string
          valor_alvo?: number
          valor_atual?: number
          valor_inicial?: number
        }
        Relationships: []
      }
      installments: {
        Row: {
          atualizado_em: string
          card_invoice_id: string
          criado_em: string
          data_vencimento: string
          id: string
          numero_parcela: number
          paga_em: string | null
          purchase_id: string
          status: Database["public"]["Enums"]["installment_status"]
          user_id: string
          valor: number
        }
        Insert: {
          atualizado_em?: string
          card_invoice_id: string
          criado_em?: string
          data_vencimento: string
          id?: string
          numero_parcela: number
          paga_em?: string | null
          purchase_id: string
          status?: Database["public"]["Enums"]["installment_status"]
          user_id: string
          valor: number
        }
        Update: {
          atualizado_em?: string
          card_invoice_id?: string
          criado_em?: string
          data_vencimento?: string
          id?: string
          numero_parcela?: number
          paga_em?: string | null
          purchase_id?: string
          status?: Database["public"]["Enums"]["installment_status"]
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "installments_card_invoice_id_user_id_fkey"
            columns: ["card_invoice_id", "user_id"]
            isOneToOne: false
            referencedRelation: "card_invoices"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "installments_purchase_id_user_id_fkey"
            columns: ["purchase_id", "user_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      investment_simulations: {
        Row: {
          aporte_mensal: number
          ativo_referencia: string
          atualizado_em: string
          classe: Database["public"]["Enums"]["investment_class"]
          considerar_ir: boolean
          criado_em: string
          data_inicio: string
          id: string
          nome: string
          parametros: Json
          percentual_referencia: number | null
          prazo_meses: number
          resultado_estimado: number | null
          taxa_manual: number | null
          user_id: string
          valor_inicial: number
        }
        Insert: {
          aporte_mensal?: number
          ativo_referencia: string
          atualizado_em?: string
          classe: Database["public"]["Enums"]["investment_class"]
          considerar_ir?: boolean
          criado_em?: string
          data_inicio?: string
          id?: string
          nome: string
          parametros?: Json
          percentual_referencia?: number | null
          prazo_meses: number
          resultado_estimado?: number | null
          taxa_manual?: number | null
          user_id: string
          valor_inicial: number
        }
        Update: {
          aporte_mensal?: number
          ativo_referencia?: string
          atualizado_em?: string
          classe?: Database["public"]["Enums"]["investment_class"]
          considerar_ir?: boolean
          criado_em?: string
          data_inicio?: string
          id?: string
          nome?: string
          parametros?: Json
          percentual_referencia?: number | null
          prazo_meses?: number
          resultado_estimado?: number | null
          taxa_manual?: number | null
          user_id?: string
          valor_inicial?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          atualizado_em: string
          avatar_url: string | null
          criado_em: string
          nome: string | null
          onboarding_concluido: boolean
          tema: string
          timezone: string
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          avatar_url?: string | null
          criado_em?: string
          nome?: string | null
          onboarding_concluido?: boolean
          tema?: string
          timezone?: string
          user_id: string
        }
        Update: {
          atualizado_em?: string
          avatar_url?: string | null
          criado_em?: string
          nome?: string | null
          onboarding_concluido?: boolean
          tema?: string
          timezone?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          atualizado_em: string
          cancelada_em: string | null
          card_id: string
          category_id: string
          criado_em: string
          data_compra: string
          data_primeira_parcela: string | null
          descricao: string
          id: string
          numero_parcelas: number
          observacao: string | null
          user_id: string
          valor_total: number
        }
        Insert: {
          atualizado_em?: string
          cancelada_em?: string | null
          card_id: string
          category_id: string
          criado_em?: string
          data_compra?: string
          data_primeira_parcela?: string | null
          descricao: string
          id?: string
          numero_parcelas?: number
          observacao?: string | null
          user_id: string
          valor_total: number
        }
        Update: {
          atualizado_em?: string
          cancelada_em?: string | null
          card_id?: string
          category_id?: string
          criado_em?: string
          data_compra?: string
          data_primeira_parcela?: string | null
          descricao?: string
          id?: string
          numero_parcelas?: number
          observacao?: string | null
          user_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchases_card_id_user_id_fkey"
            columns: ["card_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "purchases_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      recurrence_rules: {
        Row: {
          account_id: string
          ativa: boolean
          atualizado_em: string
          category_id: string
          criado_em: string
          data_fim: string | null
          data_inicio: string
          descricao: string
          dia_do_mes: number | null
          frequencia: Database["public"]["Enums"]["recurrence_frequency"]
          id: string
          intervalo: number
          proxima_execucao: string
          tipo: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          valor: number
        }
        Insert: {
          account_id: string
          ativa?: boolean
          atualizado_em?: string
          category_id: string
          criado_em?: string
          data_fim?: string | null
          data_inicio: string
          descricao: string
          dia_do_mes?: number | null
          frequencia: Database["public"]["Enums"]["recurrence_frequency"]
          id?: string
          intervalo?: number
          proxima_execucao: string
          tipo: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          valor: number
        }
        Update: {
          account_id?: string
          ativa?: boolean
          atualizado_em?: string
          category_id?: string
          criado_em?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string
          dia_do_mes?: number | null
          frequencia?: Database["public"]["Enums"]["recurrence_frequency"]
          id?: string
          intervalo?: number
          proxima_execucao?: string
          tipo?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "recurrence_rules_account_id_user_id_fkey"
            columns: ["account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "recurrence_rules_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          atualizado_em: string
          category_id: string | null
          criado_em: string
          data_competencia: string
          data_efetivacao: string | null
          descricao: string
          forma_pagamento: Database["public"]["Enums"]["payment_method"]
          id: string
          installment_id: string | null
          observacao: string | null
          recurrence_rule_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          tipo: Database["public"]["Enums"]["transaction_type"]
          transfer_account_id: string | null
          user_id: string
          valor: number
        }
        Insert: {
          account_id: string
          atualizado_em?: string
          category_id?: string | null
          criado_em?: string
          data_competencia: string
          data_efetivacao?: string | null
          descricao: string
          forma_pagamento?: Database["public"]["Enums"]["payment_method"]
          id?: string
          installment_id?: string | null
          observacao?: string | null
          recurrence_rule_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          tipo: Database["public"]["Enums"]["transaction_type"]
          transfer_account_id?: string | null
          user_id: string
          valor: number
        }
        Update: {
          account_id?: string
          atualizado_em?: string
          category_id?: string | null
          criado_em?: string
          data_competencia?: string
          data_efetivacao?: string | null
          descricao?: string
          forma_pagamento?: Database["public"]["Enums"]["payment_method"]
          id?: string
          installment_id?: string | null
          observacao?: string | null
          recurrence_rule_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          tipo?: Database["public"]["Enums"]["transaction_type"]
          transfer_account_id?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_user_id_fkey"
            columns: ["account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_installment_id_user_id_fkey"
            columns: ["installment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "installments"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_recurrence_rule_id_user_id_fkey"
            columns: ["recurrence_rule_id", "user_id"]
            isOneToOne: false
            referencedRelation: "recurrence_rules"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_transfer_account_id_user_id_fkey"
            columns: ["transfer_account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_onboarding: {
        Args: {
          p_account_color: string
          p_account_name: string
          p_account_type: Database["public"]["Enums"]["account_type"]
          p_bank_name: string
          p_card_brand: string
          p_card_color: string
          p_card_issuer: string
          p_card_name: string
          p_closing_day: number
          p_credit_limit: number
          p_due_day: number
          p_initial_balance: number
        }
        Returns: undefined
      }
    }
    Enums: {
      account_type:
        | "corrente"
        | "poupanca"
        | "investimento"
        | "dinheiro"
        | "carteira_digital"
      category_type: "receita" | "despesa"
      financial_event_type:
        | "decimo_terceiro"
        | "ferias"
        | "ir"
        | "inss"
        | "ipva"
        | "iptu"
        | "outro"
      goal_movement_type: "aporte" | "resgate" | "ajuste"
      goal_status: "ativa" | "concluida" | "pausada" | "cancelada"
      installment_status: "pendente" | "paga" | "atrasada" | "cancelada"
      investment_class: "renda_fixa" | "renda_variavel"
      invoice_status: "aberta" | "fechada" | "paga" | "atrasada" | "parcial"
      payment_method:
        | "pix"
        | "boleto"
        | "debito"
        | "credito"
        | "dinheiro"
        | "transferencia"
        | "outro"
      recurrence_frequency:
        | "semanal"
        | "quinzenal"
        | "mensal"
        | "bimestral"
        | "trimestral"
        | "semestral"
        | "anual"
      transaction_status: "prevista" | "efetivada" | "cancelada"
      transaction_type: "receita" | "despesa" | "transferencia"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: [
        "corrente",
        "poupanca",
        "investimento",
        "dinheiro",
        "carteira_digital",
      ],
      category_type: ["receita", "despesa"],
      financial_event_type: [
        "decimo_terceiro",
        "ferias",
        "ir",
        "inss",
        "ipva",
        "iptu",
        "outro",
      ],
      goal_movement_type: ["aporte", "resgate", "ajuste"],
      goal_status: ["ativa", "concluida", "pausada", "cancelada"],
      installment_status: ["pendente", "paga", "atrasada", "cancelada"],
      investment_class: ["renda_fixa", "renda_variavel"],
      invoice_status: ["aberta", "fechada", "paga", "atrasada", "parcial"],
      payment_method: [
        "pix",
        "boleto",
        "debito",
        "credito",
        "dinheiro",
        "transferencia",
        "outro",
      ],
      recurrence_frequency: [
        "semanal",
        "quinzenal",
        "mensal",
        "bimestral",
        "trimestral",
        "semestral",
        "anual",
      ],
      transaction_status: ["prevista", "efetivada", "cancelada"],
      transaction_type: ["receita", "despesa", "transferencia"],
    },
  },
} as const
