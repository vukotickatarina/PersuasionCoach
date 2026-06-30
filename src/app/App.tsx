/* MARKER-MAKE-KIT-INVOKED */
import { useState } from "react";
import { MobileShell } from "./components/MobileShell";
import { SplashScreen } from "./components/screens/SplashScreen";
import { LoginScreen } from "./components/screens/LoginScreen";
import { RegisterScreen } from "./components/screens/RegisterScreen";
import { PasswordResetScreen } from "./components/screens/PasswordResetScreen";
import { DashboardScreen } from "./components/screens/DashboardScreen";
import { ProfileScreen } from "./components/screens/ProfileScreen";
import { SelectTopicScreen } from "./components/screens/SelectTopicScreen";
import { SelectInterlocutorScreen } from "./components/screens/SelectInterlocutorScreen";
import { SelectModeScreen } from "./components/screens/SelectModeScreen";
import { ConfirmAndStartScreen } from "./components/screens/ConfirmAndStartScreen";
import { SelectScenarioScreen } from "./components/screens/SelectScenarioScreen";
import { ConversationScreen } from "./components/screens/ConversationScreen";
import { ConversationMentorScreen } from "./components/screens/ConversationMentorScreen";
import { DebateScreen } from "./components/screens/DebateScreen";
import { SessionSummaryScreen } from "./components/screens/SessionSummaryScreen";
import { AnalysisScreen } from "./components/screens/AnalysisScreen";
import { ProgressScreen } from "./components/screens/ProgressScreen";
import { ProgressReportScreen } from "./components/screens/ProgressReportScreen";
import { LearningPlanScreen } from "./components/screens/LearningPlanScreen";
import { ConversationHistoryScreen } from "./components/screens/ConversationHistoryScreen";
import { NotificationsScreen } from "./components/screens/NotificationsScreen";
import { SettingsScreen } from "./components/screens/SettingsScreen";
import { ChangeEmailScreen } from "./components/screens/ChangeEmailScreen";
import { ChangePasswordScreen } from "./components/screens/ChangePasswordScreen";
import { PrivacyScreen } from "./components/screens/PrivacyScreen";
import { FAQScreen } from "./components/screens/FAQScreen";
import { AppInfoScreen } from "./components/screens/AppInfoScreen";
import { TermsScreen } from "./components/screens/TermsScreen";
import { AboutScreen } from "./components/screens/AboutScreen";
import { OnboardingScreen } from "./components/screens/OnboardingScreen";

type Screen =
  | "splash" | "login" | "register" | "password-reset" | "about"
  | "onboarding"
  | "dashboard" | "profile"
  | "select-topic" | "select-interlocutor" | "select-mode" | "confirm-start"
  | "select-scenario"
  | "conversation" | "conversation-mentor" | "debate"
  | "session-summary" | "analysis"
  | "progress" | "progress-report" | "learning-plan"
  | "conversation-history"
  | "notifications" | "settings"
  | "change-email" | "change-password" | "privacy" | "faq" | "app-info" | "terms";

type Mode = "attacker" | "mentor" | "debate";

const INTERLOCUTOR_META: Record<string, { label: string }> = {
  SKEPTICAL_FRIEND: { label: "Prijatelj" },
  PARENT:           { label: "Roditelj"  },
  AUTHORITY:        { label: "Autoritet" },
  STRANGER:         { label: "Stranac"   },
  DEBATER:          { label: "Debater"   },
};

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");

  // New flow state
  const [selectedTopicTitle, setSelectedTopicTitle] = useState<string>("");
  const [customContext, setCustomContext] = useState<string | undefined>(undefined);
  const [selectedInterlocutor, setSelectedInterlocutor] = useState<string>("STRANGER");
  const [selectedMode, setSelectedMode] = useState<Mode>("attacker");

  // Active session (set after ConfirmAndStartScreen starts it)
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [activeInitialMessages, setActiveInitialMessages] = useState<{ from: string; text: string }[]>([]);
  const [analysisSessionId, setAnalysisSessionId] = useState<number | null>(null);

  // Legacy state (kept for SelectScenarioScreen compatibility)
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<number | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const navigate = (s: string) => setScreen(s as Screen);

  const handleLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    sessionStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleSelectTopic = (topicTitle: string, ctx?: string) => {
    setSelectedTopicTitle(topicTitle);
    setCustomContext(ctx);
  };

  const handleRealSituation = (personName: string, situation: string) => {
    setSelectedTopicTitle("Stvarna situacija: " + personName);
    setCustomContext(situation);
    setSelectedInterlocutor("AUTHORITY");
    navigate("select-mode");
  };

  const handleSelectInterlocutor = (type: string) => {
    setSelectedInterlocutor(type);
  };

  const handleSelectMode = (mode: Mode) => {
    setSelectedMode(mode);
  };

  const handleSessionStarted = (sessionId: number, initialMessages: { from: string; text: string }[]) => {
    setActiveSessionId(sessionId);
    setActiveInitialMessages(initialMessages);
  };

  const interlocutorMeta = INTERLOCUTOR_META[selectedInterlocutor] ?? { label: selectedInterlocutor };

  const renderScreen = () => {
    switch (screen) {
      case "splash":       return <SplashScreen onNavigate={navigate} />;
      case "login":        return <LoginScreen onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
      case "register":     return <RegisterScreen onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
      case "password-reset": return <PasswordResetScreen onNavigate={navigate} />;
      case "about":        return <AboutScreen onNavigate={navigate} />;
      case "onboarding":   return <OnboardingScreen onNavigate={navigate} userName={currentUser?.name} />;
      case "dashboard":    return <DashboardScreen onNavigate={navigate} user={currentUser} />;
      case "profile":      return <ProfileScreen onNavigate={navigate} user={currentUser} />;

      case "select-topic":
        return (
          <SelectTopicScreen
            onNavigate={navigate}
            onSelectTopic={handleSelectTopic}
            onRealSituation={handleRealSituation}
            currentTopicTitle={selectedTopicTitle || undefined}
          />
        );

      case "select-interlocutor":
        return (
          <SelectInterlocutorScreen
            onNavigate={navigate}
            topicTitle={selectedTopicTitle}
            onSelectInterlocutor={handleSelectInterlocutor}
            currentInterlocutor={selectedInterlocutor || undefined}
          />
        );

      case "select-mode":
        return (
          <SelectModeScreen
            onNavigate={navigate}
            onSelectMode={handleSelectMode}
            topicTitle={selectedTopicTitle}
            interlocutorLabel={interlocutorMeta.label}
            currentMode={selectedMode}
          />
        );

      case "confirm-start":
        return (
          <ConfirmAndStartScreen
            onNavigate={navigate}
            topicTitle={selectedTopicTitle}
            interlocutor={selectedInterlocutor}
            interlocutorLabel={interlocutorMeta.label}
            mode={selectedMode}
            customContext={customContext}
            onSessionStarted={handleSessionStarted}
          />
        );

      case "select-scenario":
        return (
          <SelectScenarioScreen
            onNavigate={navigate}
            mode={selectedMode}
            topicId={selectedTopicId}
            onSelectScenario={id => setSelectedScenarioId(id)}
          />
        );

      case "conversation":
        return (
          <ConversationScreen
            onNavigate={navigate}
            mode={selectedMode}
            scenarioId={selectedScenarioId}
            sessionId={activeSessionId}
            initialMessages={activeInitialMessages}
          />
        );

      case "conversation-mentor":
        return <ConversationMentorScreen onNavigate={navigate} sessionId={activeSessionId} />;

      case "debate":              return <DebateScreen onNavigate={navigate} />;
      case "session-summary":     return <SessionSummaryScreen onNavigate={navigate} sessionId={activeSessionId} />;
      case "analysis":            return <AnalysisScreen onNavigate={navigate} sessionId={analysisSessionId ?? activeSessionId} />;
      case "progress":            return <ProgressScreen onNavigate={navigate} />;
      case "progress-report":     return <ProgressReportScreen onNavigate={navigate} />;
      case "learning-plan":       return <LearningPlanScreen onNavigate={navigate} />;
      case "conversation-history": return <ConversationHistoryScreen onNavigate={navigate} onOpenAnalysis={(id) => { setAnalysisSessionId(id); navigate("analysis"); }} />;
      case "notifications":       return <NotificationsScreen onNavigate={navigate} onOpenAnalysis={(id) => { setAnalysisSessionId(id); navigate("analysis"); }} />;
      case "settings":            return <SettingsScreen onNavigate={navigate} />;
      case "change-email":        return <ChangeEmailScreen onNavigate={navigate} />;
      case "change-password":     return <ChangePasswordScreen onNavigate={navigate} />;
      case "privacy":             return <PrivacyScreen onNavigate={navigate} />;
      case "faq":                 return <FAQScreen onNavigate={navigate} />;
      case "app-info":            return <AppInfoScreen onNavigate={navigate} />;
      case "terms":               return <TermsScreen onNavigate={navigate} />;
      default:                    return <SplashScreen onNavigate={navigate} />;
    }
  };

  return (
    <div>
      <MobileShell>
        {renderScreen()}
      </MobileShell>
    </div>
  );
}
