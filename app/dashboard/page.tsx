"use client";

import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  Users,
  Settings,
  Bell,
  LogOut,
  Search,
  BarChart3,
  ShieldCheck,
  Package,
  CalendarCheck,
  FileText,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white overflow-hidden">
        Loading...
      </div>
    );
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Machines",
      icon: Wrench,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Maintenance",
      icon: ClipboardList,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Tickets",
      icon: FileText,
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Stock Pièces",
      icon: Package,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Planning",
      icon: CalendarCheck,
      color: "from-indigo-500 to-violet-500",
    },
    {
      title: "Rapports",
      icon: BarChart3,
      color: "from-teal-500 to-cyan-500",
    },
    {
      title: "Utilisateurs",
      icon: Users,
      color: "from-purple-500 to-fuchsia-500",
    },
    {
      title: "Sécurité",
      icon: ShieldCheck,
      color: "from-lime-500 to-green-500",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-white overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">

        {/* LOGO */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-3xl font-bold tracking-wide">
            GMAO
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            Gestion Maintenance Assistée
          </p>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">

          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={index}
                className={`
                  w-full flex items-center gap-4
                  p-4 rounded-2xl
                  bg-gradient-to-r ${item.color}
                  hover:scale-[1.02]
                  transition-all duration-300
                  shadow-lg hover:shadow-2xl
                `}
              >
                <Icon size={22} />

                <span className="font-semibold text-left">
                  {item.title}
                </span>
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="
              w-full flex items-center justify-center gap-2
              bg-red-600 hover:bg-red-700
              py-3 rounded-xl
              transition-all
              font-semibold
            "
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden">

        {/* TOPBAR */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">

          <div>
            <h2 className="text-4xl font-bold">
              Dashboard
            </h2>

            <p className="text-slate-400 mt-1">
              Bienvenue dans votre plateforme GMAO
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">

            <div className="
              flex items-center gap-2
              bg-slate-900 px-4 py-3 rounded-xl
              border border-slate-800
              w-full sm:w-auto
            ">
              <Search size={18} className="text-slate-400" />

              <input
                type="text"
                placeholder="Recherche..."
                className="
                  bg-transparent outline-none
                  text-sm text-white
                  placeholder:text-slate-500
                  w-full
                "
              />
            </div>

            <button className="
              p-3 rounded-xl
              bg-slate-900 border border-slate-800
              hover:bg-slate-800 transition
            ">
              <Bell size={20} />
            </button>

            <button className="
              p-3 rounded-xl
              bg-slate-900 border border-slate-800
              hover:bg-slate-800 transition
            ">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <p className="text-slate-400 text-sm">
              Machines
            </p>

            <h3 className="text-4xl font-bold mt-3">
              24
            </h3>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <p className="text-slate-400 text-sm">
              Tickets ouverts
            </p>

            <h3 className="text-4xl font-bold mt-3 text-orange-400">
              8
            </h3>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <p className="text-slate-400 text-sm">
              Interventions
            </p>

            <h3 className="text-4xl font-bold mt-3 text-cyan-400">
              53
            </h3>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <p className="text-slate-400 text-sm">
              Techniciens
            </p>

            <h3 className="text-4xl font-bold mt-3 text-green-400">
              12
            </h3>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">
              Actions rapides
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

            <button className="
              bg-cyan-600 hover:bg-cyan-700
              rounded-2xl p-5 text-left
              transition-all shadow-lg
            ">
              <Wrench className="mb-3" />

              <h4 className="font-bold text-lg">
                Ajouter Machine
              </h4>
            </button>

            <button className="
              bg-orange-600 hover:bg-orange-700
              rounded-2xl p-5 text-left
              transition-all shadow-lg
            ">
              <ClipboardList className="mb-3" />

              <h4 className="font-bold text-lg">
                Nouveau Ticket
              </h4>
            </button>

            <button className="
              bg-green-600 hover:bg-green-700
              rounded-2xl p-5 text-left
              transition-all shadow-lg
            ">
              <Users className="mb-3" />

              <h4 className="font-bold text-lg">
                Gérer Utilisateurs
              </h4>
            </button>

            <button className="
              bg-purple-600 hover:bg-purple-700
              rounded-2xl p-5 text-left
              transition-all shadow-lg
            ">
              <BarChart3 className="mb-3" />

              <h4 className="font-bold text-lg">
                Voir Rapports
              </h4>
            </button>

          </div>
        </div>

      </main>
    </div>
  );
}