import { useNavigate } from "react-router-dom";
import { NavBar } from "./ui/tubelight-navbar";
import { Home, BookOpen, Users, LogIn, Bot } from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();

  const handleSectionScroll = (sectionId: string) => {
    // Check if we're on the home page
    if (window.location.pathname === "/") {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If not on home page, navigate to home page with section hash
      navigate(`/#${sectionId}`);
    }
  };

  const navItems = [
    {
      name: "Home",
      url: "/",
      icon: Home,
      onClick: () => handleSectionScroll("hero"),
    },
    {
      name: "Courses",
      url: "/#programs",
      icon: BookOpen,
      onClick: () => handleSectionScroll("programs"),
    },
    {
      name: "Features",
      url: "/#features",
      icon: Users,
      onClick: () => handleSectionScroll("features"),
    },
    {
      name: "AI Demo",
      url: "/ai-demo",
      icon: Bot,
      onClick: () => navigate("/ai-demo"),
    },
    {
      name: "Sign In",
      url: "/auth",
      icon: LogIn,
      onClick: () => navigate("/auth"),
    },
  ];

  return <NavBar items={navItems} className="bg-transparent" />;
};

export default Navigation;
