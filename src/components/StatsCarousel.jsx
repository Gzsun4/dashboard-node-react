import React from 'react';
import StatsCard from './StatsCard';

const StatsCarousel = ({ stats }) => {
    return (
        <div
            className="flex gap-4 overflow-x-auto pb-4 mb-6 snap-x no-scrollbar hidden-desktop"
            style={{
                marginLeft: '-1.25rem', // -mx-5
                marginRight: '-1.25rem',
                paddingLeft: '1.25rem', // px-5
                paddingRight: '1.25rem',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE/Edge
                display: 'flex',
                flexWrap: 'nowrap',
                whiteSpace: 'nowrap'
            }}
        >
            {stats.map((stat, index) => (
                <StatsCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    colorClass={stat.color}
                />
            ))}
            <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
};

export default StatsCarousel;
