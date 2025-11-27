'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { 
  formatEtherValue, 
  formatDateFromTimestamp, 
  calculateVaultAge,
  formatTimeUntilDistribution 
} from '@/lib/contracts/utils';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { type VaultSummary } from '@/lib/contracts';

interface VaultTimelineProps {
  summary: VaultSummary;
  isOwner?: boolean;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp?: bigint;
  icon: React.ReactNode;
  status: 'completed' | 'active' | 'upcoming';
  type: 'creation' | 'activity' | 'distribution' | 'execution';
}

export function VaultTimeline({ summary, isOwner }: VaultTimelineProps) {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const creationTime = Number(summary.lastActiveTimestamp) - Number(summary.inactivityPeriod);
    const nextActivityDeadline = Number(summary.lastActiveTimestamp) + Number(summary.inactivityPeriod);

    const events: TimelineEvent[] = [
      {
        id: 'creation',
        title: 'Vault Created',
        description: `Initial deposit of ${formatEtherValue(summary.ethBalance)} ETH`,
        timestamp: BigInt(creationTime),
        icon: <Calendar className="w-4 h-4" />,
        status: 'completed',
        type: 'creation'
      },
      {
        id: 'last-activity',
        title: 'Last Activity',
        description: `Owner performed "I'm Alive" action`,
        timestamp: summary.lastActiveTimestamp,
        icon: <Activity className="w-4 h-4" />,
        status: 'completed',
        type: 'activity'
      },
      {
        id: 'distribution-deadline',
        title: 'Distribution Deadline',
        description: summary.executed 
          ? 'Vault has been executed and assets distributed'
          : `Assets will be available for distribution in ${formatTimeUntilDistribution(summary.timeUntilDistribution)}`,
        timestamp: BigInt(nextActivityDeadline),
        icon: summary.executed ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />,
        status: summary.executed ? 'completed' : 'upcoming',
        type: 'distribution'
      }
    ];

    // Add execution event if vault has been executed
    if (summary.executed) {
      events.push({
        id: 'execution',
        title: 'Vault Executed',
        description: `Assets successfully distributed to beneficiary`,
        icon: <CheckCircle className="w-4 h-4" />,
        status: 'completed',
        type: 'execution'
      });
    }

    setTimelineEvents(events);
  }, [summary]);

  const calculateProgress = () => {
    if (summary.executed) return 100;
    
    const now = Math.floor(Date.now() / 1000);
    const lastActivity = Number(summary.lastActiveTimestamp);
    const deadline = lastActivity + Number(summary.inactivityPeriod);
    
    const totalPeriod = Number(summary.inactivityPeriod);
    const elapsed = Math.min(now - lastActivity, totalPeriod);
    
    return (elapsed / totalPeriod) * 100;
  };

  const getProgressSteps = () => [
    { id: 'created', label: 'Created' },
    { id: 'active', label: 'Active' },
    { id: 'ready', label: summary.executed ? 'Executed' : 'Ready' }
  ];

  const getCurrentStep = () => {
    if (summary.executed) return 2;
    if (summary.canDistribute) return 2;
    return 1;
  };

  return (
    <Card glass={true} className="border border-white/20">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-4 h-4 text-soul-red" />
          <h3 className="text-sm font-family-heading text-ghost-white">
            Vault Timeline
          </h3>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar 
            steps={getProgressSteps()}
            currentStep={getCurrentStep()}
          />
          <div className="mt-4 flex justify-between text-xs text-silver-dust">
            <span>Created {calculateVaultAge(BigInt(Math.floor(Date.now() / 1000) - Number(summary.inactivityPeriod)))} days ago</span>
            <span>{summary.executed ? 'Executed' : `${Math.round(calculateProgress())}% through inactivity period`}</span>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
          
          {/* Events */}
          <div className="space-y-6">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4"
              >
                {/* Event Icon */}
                <div className={`
                  relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                  ${event.status === 'completed' ? 'bg-emerald-500/20 border-emerald-500/50' : 
                    event.status === 'active' ? 'bg-soul-red/20 border-soul-red/50' : 
                    'bg-charcoal border-white/20'}
                  border
                `}>
                  {event.icon}
                </div>
                
                {/* Event Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-family-heading ${
                      event.status === 'completed' ? 'text-emerald-400' :
                      event.status === 'active' ? 'text-soul-red' :
                      'text-silver-dust'
                    }`}>
                      {event.title}
                    </h4>
                    {event.timestamp && (
                      <span className="text-xs text-silver-dust">
                        {formatDateFromTimestamp(event.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-silver-dust">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next Action for Owner */}
        {isOwner && !summary.executed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-soul-red/10 rounded-lg border border-soul-red/20"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-soul-red mt-0.5" />
              <div>
                <h4 className="text-sm font-family-heading text-ghost-white mb-1">
                  {summary.canDistribute ? 'Vault Ready for Distribution' : 'Action Required'}
                </h4>
                <p className="text-xs text-silver-dust mb-3">
                  {summary.canDistribute 
                    ? 'The vault is ready to be executed and assets distributed to the beneficiary.'
                    : 'Update your activity before the deadline to prevent distribution.'
                  }
                </p>
                <div className="flex items-center gap-2 text-xs text-soul-red">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeUntilDistribution(summary.timeUntilDistribution)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
