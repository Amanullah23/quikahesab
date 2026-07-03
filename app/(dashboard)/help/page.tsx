import {
  Receipt,
  Wallet,
  XCircle,
  Users,
  Upload,
  Package,
  Phone,
} from "lucide-react";

const guides = [
  {
    icon: Receipt,
    title: "Adding a Bill",
    steps: [
      "Go to Bills → click \"Add Bill\"",
      "Enter a unique bill number (must not already exist)",
      "Select the customer and their package",
      "Amount fills in automatically from the package price — adjust if needed",
      "Pick the start date and click \"Create Bill\"",
    ],
  },
  {
    icon: Wallet,
    title: "Recording a Payment",
    steps: [
      "Open the bill from the Bills list",
      "Enter the payment amount (defaults to the full remaining balance)",
      "Click \"Record Payment\" — status updates automatically",
      "Partial payments are allowed — the bill stays \"Partial\" until fully paid",
    ],
  },
  {
    icon: XCircle,
    title: "Cancelling a Bill",
    steps: [
      "Only Admin accounts can cancel a bill",
      "Open the bill → click \"Cancel Bill\" → confirm with an optional reason",
      "Cancelled bills cannot be edited or paid afterward",
    ],
  },
  {
    icon: Users,
    title: "Managing Customers",
    steps: [
      "Go to Customers → \"Add Customer\" for a single entry",
      "Edit a customer to update their WhatsApp number, package, or active status",
      "If a WhatsApp number is wrong, uncheck \"WhatsApp number is valid\" on their edit page",
    ],
  },
  {
    icon: Upload,
    title: "Importing Customers (CSV)",
    steps: [
      "Go to Customers → \"Import CSV\"",
      "File must have columns: full_name, whatsapp_number, package_name",
      "package_name must exactly match an existing package",
      "Any failed rows are listed with the reason — fix and re-upload just those",
    ],
  },
  {
    icon: Package,
    title: "Managing Packages",
    steps: [
      "Go to Packages → \"Add Package\"",
      "Choose Monthly (unlimited) or Data-based (limited GB) — this cannot be changed later",
      "To retire a package, edit it and uncheck \"Active\" instead of deleting",
    ],
  },
];

export default function HelpPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-text mb-1">Help</h1>
      <p className="text-text-muted mb-8">Quick guides for everyday tasks in QuikaHesab</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {guides.map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.title} className="bg-card border border-border rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-9 h-9 rounded-xl bg-forest text-white flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </span>
                <h2 className="font-display font-bold text-text">{g.title}</h2>
              </div>
              <ol className="space-y-2 text-sm text-text-muted list-decimal list-inside">
                {g.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>

      <div className="bg-forest text-white rounded-3xl p-6 flex items-center gap-4">
        <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
          <Phone size={18} />
        </span>
        <div>
          <p className="font-display font-bold">Need more help?</p>
          <p className="text-sm text-white/70 mt-0.5">
            Contact your system admin directly for account issues or anything not covered here.
          </p>
        </div>
      </div>
    </div>
  );
}