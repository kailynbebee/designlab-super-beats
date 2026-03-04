import { X, Trash2, Upload } from 'lucide-react';

interface SavedBeat {
  id: string;
  name: string;
  pattern: any;
  tempo: number;
  createdAt: string;
  updatedAt: string;
}

interface SavedBeatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  beats: SavedBeat[];
  onLoadBeat: (beat: SavedBeat) => void;
  onDeleteBeat: (beatId: string) => void;
}

export default function SavedBeatsModal({ 
  isOpen, 
  onClose, 
  beats, 
  onLoadBeat, 
  onDeleteBeat 
}: SavedBeatsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[#18181b] border-2 border-[#3f3f47] rounded-[12px] p-[32px] w-full max-w-[600px] max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-[16px] right-[16px] text-[#9f9fa9] hover:text-[#f1f5f9] transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[#f8fafc] text-[28px] mb-[24px]">
          Saved Beats
        </h2>

        {beats.length === 0 ? (
          <div className="text-center py-[40px]">
            <p className="text-[#9f9fa9] font-['Inter:Medium',sans-serif] text-[16px]">
              No saved beats yet. Create and save your first beat!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {beats.map((beat) => (
              <div
                key={beat.id}
                className="bg-[#27272a] border border-[#3f3f47] rounded-[8px] p-[16px] hover:border-[#8200db] transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-['Inter:Medium',sans-serif] font-medium text-[#f1f5f9] text-[18px] mb-[4px]">
                      {beat.name}
                    </h3>
                    <p className="text-[#9f9fa9] text-[14px] font-['Inter:Regular',sans-serif]">
                      Tempo: {beat.tempo} BPM • {new Date(beat.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-[8px] items-center">
                    <button
                      onClick={() => onLoadBeat(beat)}
                      className="bg-[#8200db] hover:bg-[#9500f5] text-[#f8fafc] px-[16px] py-[8px] rounded-[4px] flex items-center gap-[8px] transition-colors"
                    >
                      <Upload size={16} />
                      Load
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${beat.name}"?`)) {
                          onDeleteBeat(beat.id);
                        }
                      }}
                      className="text-[#9f9fa9] hover:text-red-500 p-[8px] transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
