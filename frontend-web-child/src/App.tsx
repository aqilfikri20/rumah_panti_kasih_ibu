import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/Dashboard";
import Children from "./pages/Children";
import ChildDetail from "./pages/ChildDetail";
import Reminders from "./pages/Reminders";
import Notes from "./pages/Notes";
import Caregivers from "./pages/Caregivers";
import Needs from "./pages/Needs";
import { AppDataProvider } from "./services/AppDataContext";
function AIAssistant() {
  return <div>AI Assistant</div>;
}

export default function App() {
  return (
    <AppDataProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/children" element={<Children />} />
          <Route path="/caregivers" element={<Caregivers />} />
          <Route path="/needs" element={<Needs />} />
          <Route path="/children/:id" element={<ChildDetail />}/>
          <Route
            path="/reminders"
            element={<Reminders />}
          />
          <Route
              path="/notes"
              element={<Notes />}
            />
          <Route path="/ai" element={<AIAssistant />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AppDataProvider>
  );
}
