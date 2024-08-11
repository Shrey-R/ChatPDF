import { ArrowRight, HelpCircle } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const UpgradeButton = () => {
  return (
    <div className="w-full">
      <Tooltip>
        <TooltipTrigger
          className="w-full cursor-default ml-1.5 flex justify-center gap-4 items-center"
        >
          Upgrade now 
          <ArrowRight className="h-5 w-5 ml-1.5" />
        </TooltipTrigger>
        <TooltipContent className="w-80 p-2">
        <p><strong>Note:</strong> Payment functionality is currently in Beta. We are finalizing our payment processing setup, and the Pro Plan will be available soon. Please check back later.</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default UpgradeButton;
