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
      balls: {
        Row: {
          ball_no: number
          batter_id: string | null
          bowler_id: string | null
          commentary: string | null
          created_at: string
          dismissal_type: Database["public"]["Enums"]["dismissal_type"] | null
          dismissed_player_id: string | null
          extra_runs: number
          extra_type: Database["public"]["Enums"]["extra_type"]
          id: string
          innings_no: number
          is_wicket: boolean
          match_id: string
          non_striker_id: string | null
          over_no: number
          runs: number
        }
        Insert: {
          ball_no: number
          batter_id?: string | null
          bowler_id?: string | null
          commentary?: string | null
          created_at?: string
          dismissal_type?: Database["public"]["Enums"]["dismissal_type"] | null
          dismissed_player_id?: string | null
          extra_runs?: number
          extra_type?: Database["public"]["Enums"]["extra_type"]
          id?: string
          innings_no: number
          is_wicket?: boolean
          match_id: string
          non_striker_id?: string | null
          over_no: number
          runs?: number
        }
        Update: {
          ball_no?: number
          batter_id?: string | null
          bowler_id?: string | null
          commentary?: string | null
          created_at?: string
          dismissal_type?: Database["public"]["Enums"]["dismissal_type"] | null
          dismissed_player_id?: string | null
          extra_runs?: number
          extra_type?: Database["public"]["Enums"]["extra_type"]
          id?: string
          innings_no?: number
          is_wicket?: boolean
          match_id?: string
          non_striker_id?: string | null
          over_no?: number
          runs?: number
        }
        Relationships: [
          {
            foreignKeyName: "balls_batter_id_fkey"
            columns: ["batter_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balls_bowler_id_fkey"
            columns: ["bowler_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balls_dismissed_player_id_fkey"
            columns: ["dismissed_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balls_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balls_non_striker_id_fkey"
            columns: ["non_striker_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      innings: {
        Row: {
          balls: number
          batting_team_id: string
          bowling_team_id: string
          created_at: string
          extras: number
          id: string
          innings_no: number
          is_completed: boolean
          match_id: string
          runs: number
          wickets: number
        }
        Insert: {
          balls?: number
          batting_team_id: string
          bowling_team_id: string
          created_at?: string
          extras?: number
          id?: string
          innings_no: number
          is_completed?: boolean
          match_id: string
          runs?: number
          wickets?: number
        }
        Update: {
          balls?: number
          batting_team_id?: string
          bowling_team_id?: string
          created_at?: string
          extras?: number
          id?: string
          innings_no?: number
          is_completed?: boolean
          match_id?: string
          runs?: number
          wickets?: number
        }
        Relationships: [
          {
            foreignKeyName: "innings_batting_team_id_fkey"
            columns: ["batting_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innings_bowling_team_id_fkey"
            columns: ["bowling_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          batting_first_id: string | null
          created_at: string
          current_innings: number
          id: string
          overs: number
          result_text: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          team_a_id: string
          team_b_id: string
          toss_winner_id: string | null
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          batting_first_id?: string | null
          created_at?: string
          current_innings?: number
          id?: string
          overs?: number
          result_text?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          team_a_id: string
          team_b_id: string
          toss_winner_id?: string | null
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          batting_first_id?: string | null
          created_at?: string
          current_innings?: number
          id?: string
          overs?: number
          result_text?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          team_a_id?: string
          team_b_id?: string
          toss_winner_id?: string | null
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_batting_first_id_fkey"
            columns: ["batting_first_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_toss_winner_id_fkey"
            columns: ["toss_winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          id: string
          jersey_number: number | null
          name: string
          role: Database["public"]["Enums"]["player_role"]
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jersey_number?: number | null
          name: string
          role?: Database["public"]["Enums"]["player_role"]
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jersey_number?: number | null
          name?: string
          role?: Database["public"]["Enums"]["player_role"]
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          captain_name: string | null
          created_at: string
          id: string
          name: string
          short_name: string | null
          tournament_id: string
        }
        Insert: {
          captain_name?: string | null
          created_at?: string
          id?: string
          name: string
          short_name?: string | null
          tournament_id: string
        }
        Update: {
          captain_name?: string | null
          created_at?: string
          id?: string
          name?: string
          short_name?: string | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          description: string | null
          format: Database["public"]["Enums"]["tournament_format"]
          id: string
          name: string
          organizer_id: string
          overs_per_innings: number
          start_date: string | null
          status: Database["public"]["Enums"]["tournament_status"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          format?: Database["public"]["Enums"]["tournament_format"]
          id?: string
          name: string
          organizer_id: string
          overs_per_innings?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["tournament_status"]
        }
        Update: {
          created_at?: string
          description?: string | null
          format?: Database["public"]["Enums"]["tournament_format"]
          id?: string
          name?: string
          organizer_id?: string
          overs_per_innings?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["tournament_status"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "organizer" | "manager" | "scorer" | "umpire"
      dismissal_type:
        | "bowled"
        | "caught"
        | "lbw"
        | "run_out"
        | "stumped"
        | "hit_wicket"
        | "retired_out"
      extra_type: "none" | "wide" | "no_ball" | "bye" | "leg_bye"
      match_status: "scheduled" | "live" | "completed" | "abandoned"
      player_role: "batter" | "bowler" | "allrounder" | "wicketkeeper"
      tournament_format: "round_robin" | "knockout" | "league"
      tournament_status: "upcoming" | "live" | "completed"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["super_admin", "organizer", "manager", "scorer", "umpire"],
      dismissal_type: [
        "bowled",
        "caught",
        "lbw",
        "run_out",
        "stumped",
        "hit_wicket",
        "retired_out",
      ],
      extra_type: ["none", "wide", "no_ball", "bye", "leg_bye"],
      match_status: ["scheduled", "live", "completed", "abandoned"],
      player_role: ["batter", "bowler", "allrounder", "wicketkeeper"],
      tournament_format: ["round_robin", "knockout", "league"],
      tournament_status: ["upcoming", "live", "completed"],
    },
  },
} as const
