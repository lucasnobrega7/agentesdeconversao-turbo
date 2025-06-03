// Core Motion Primitives Components
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';
export { AnimatedBackground } from './animated-background';
export { AnimatedGroup } from './animated-group';
export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel';
export { Cursor } from './cursor';
export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
export { Dock, DockIcon } from './dock';
export { GlowEffect } from './glow-effect';
export { InView } from './in-view';
export { InfiniteSlider } from './infinite-slider';
export { MorphingDialog, MorphingDialogTrigger, MorphingDialogContent, MorphingDialogTitle, MorphingDialogSubtitle, MorphingDialogDescription, MorphingDialogClose, MorphingDialogFooter, MorphingDialogContainer } from './morphing-dialog';
export { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent } from './morphing-popover';
export { ProgressiveBlur } from './progressive-blur';
export { SlidingNumber } from './sliding-number';
export { TextEffect } from './text-effect';
export { TextMorph } from './text-morph';
export { TextShimmer } from './text-shimmer';
export { default as ToolbarDynamic } from './toolbar-dynamic';
export { TransitionPanel } from './transition-panel';

// Utility hooks
export { default as useClickOutside } from './useClickOutside';
export { default as usePreventScroll } from './usePreventScroll';

// New Motion Components for the project
export { MotionToaster, toast } from './motion-toaster';
export { 
  MotionSkeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonAvatar, 
  SkeletonButton 
} from './motion-skeleton';
export { 
  MotionCard, 
  MotionCardHeader, 
  MotionCardTitle, 
  MotionCardDescription, 
  MotionCardContent, 
  MotionCardFooter 
} from './motion-card';
export { 
  MotionLoading, 
  MotionLoadingOverlay, 
  MotionPageLoading 
} from './motion-loading';

// Re-export motion for convenience
export { motion, AnimatePresence, MotionConfig } from 'motion/react';
