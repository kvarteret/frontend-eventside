import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUser } from "@/providers/UserProvider"

const navItems = [
    {
        label: "Opprett",
        href: "/",
    },
    {
        label: "Alle",
        href: "/events",
    },
]

export default function Navbar() {
    const { pathname } = useLocation()
    const { logout } = useUser()

    return (
        <header className="border-b bg-background">
            <nav className="flex justify-between items-center px-10">
                <div className=" h-16 flex items-center gap-16">
                    <div className="text-lg font-semibold tracking-tight">Kvarteret Events</div>

                    <div className="flex items-center gap-1">
                        {navItems.map(item => {
                            const isActive =
                                item.href === "/events"
                                    ? pathname.startsWith("/events")
                                    : pathname === item.href

                            return (
                                <Link key={item.href} to={item.href}>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "relative px-4 text-sm font-medium",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            isActive && "text-foreground",
                                        )}
                                    >
                                        {item.label}

                                        {isActive && (
                                            <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-foreground rounded-full" />
                                        )}
                                    </Button>
                                </Link>
                            )
                        })}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className={
                        "relative px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground font-bold"
                    }
                    onClick={logout}
                >
                    LOGOUT
                </Button>
            </nav>
        </header>
    )
}
