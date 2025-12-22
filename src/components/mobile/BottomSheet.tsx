import { ReactNode } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
}

const BottomSheet = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  className,
  contentClassName,
}: BottomSheetProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      
      <DrawerContent className={cn("max-h-[90vh]", className)}>
        {/* Header */}
        {(title || description || showCloseButton) && (
          <DrawerHeader className="relative">
            {showCloseButton && (
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            )}
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
        )}

        {/* Content */}
        <div className={cn("px-4 pb-4 overflow-y-auto", contentClassName)}>
          {children}
        </div>

        {/* Footer */}
        {footer && <DrawerFooter className="safe-area-bottom">{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  );
};

// Convenience components for common use cases
interface ConfirmBottomSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

const ConfirmBottomSheet = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  isLoading = false,
}: ConfirmBottomSheetProps) => {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      showCloseButton={false}
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            className="flex-1"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : confirmLabel}
          </Button>
        </div>
      }
    >
      <div />
    </BottomSheet>
  );
};

// Action sheet with list of options
interface ActionSheetOption {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface ActionBottomSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  options: ActionSheetOption[];
}

const ActionBottomSheet = ({
  open,
  onOpenChange,
  title,
  options,
}: ActionBottomSheetProps) => {
  const handleOptionClick = (option: ActionSheetOption) => {
    option.onClick();
    onOpenChange?.(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      showCloseButton={!!title}
    >
      <div className="space-y-1">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled={option.disabled}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
              "hover:bg-muted/80 active:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
              option.variant === "destructive" && "text-destructive hover:bg-destructive/10"
            )}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
};

export { BottomSheet, ConfirmBottomSheet, ActionBottomSheet };
export default BottomSheet;