import { Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import ChartTypesPage from "@/pages/ChartTypes";
import ConfigurationPage from "@/pages/Configuration";
import EventsPage from "@/pages/Events";
import AdvancedFeaturesPage from "@/pages/AdvancedFeatures";
import DataHandlingPage from "@/pages/DataHandling";
import PriceFormattersPage from "@/pages/PriceFormatters";
import TechnicalIndicatorsPage from "@/pages/TechnicalIndicators";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();
  const { isDark } = useTheme();

  // 处理导航点击
  const handleNavClick = (section: string) => {
    setActiveSection(section);
  };

  // 当路由变化时自动更新活动部分
  useEffect(() => {
    // 从路径中提取部分ID
    const path = location.pathname;
    if (path === "/") {
      setActiveSection("home");
    } else {
      // 移除前导斜杠并设置为活动部分
      setActiveSection(path.substring(1));
    }
  }, [location.pathname]);

  return (
    <div className={cn("min-h-screen transition-colors duration-300", isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900")}>
      <Navbar activeSection={activeSection} onNavClick={handleNavClick} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chart-types" element={<ChartTypesPage />} />
          <Route path="/configuration" element={<ConfigurationPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/advanced-features" element={<AdvancedFeaturesPage />} />
          <Route path="/data-handling" element={<DataHandlingPage />} />
          <Route path="/price-formatters" element={<PriceFormattersPage />} />
          <Route path="/technical-indicators" element={<TechnicalIndicatorsPage />} />
        </Routes>
      </main>
    </div>
  );
}
