'use client';

interface RoleSelectorProps {
  currentRole: 'exec' | 'strategist' | 'creative' | 'analyst';
  onRoleChange: (role: 'exec' | 'strategist' | 'creative' | 'analyst') => void;
}

export function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  const roles = [
    {
      id: 'exec' as const,
      name: 'Executive',
      icon: '💼',
      description: 'ROI focus, strategic insights',
      color: 'purple'
    },
    {
      id: 'strategist' as const, 
      name: 'Strategist',
      icon: '🎯',
      description: 'Campaign optimization, targeting',
      color: 'blue'
    },
    {
      id: 'creative' as const,
      name: 'Creative',
      icon: '🎨', 
      description: 'Visual performance, messaging',
      color: 'pink'
    },
    {
      id: 'analyst' as const,
      name: 'Analyst',
      icon: '📊',
      description: 'Deep metrics, data insights',
      color: 'green'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      purple: isActive 
        ? 'bg-purple-500 text-white border-purple-500' 
        : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      blue: isActive
        ? 'bg-blue-500 text-white border-blue-500'
        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      pink: isActive
        ? 'bg-pink-500 text-white border-pink-500'
        : 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100',
      green: isActive
        ? 'bg-green-500 text-white border-green-500'
        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700 mr-2">Role:</span>
      <div className="flex space-x-1">
        {roles.map((role) => {
          const isActive = currentRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => onRoleChange(role.id)}
              className={`
                relative group px-3 py-2 rounded-lg border transition-all duration-200
                ${getColorClasses(role.color, isActive)}
              `}
              title={role.description}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm">{role.icon}</span>
                <span className="text-sm font-medium">{role.name}</span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {role.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}