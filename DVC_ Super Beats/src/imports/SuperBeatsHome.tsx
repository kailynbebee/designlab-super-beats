import svgPaths from "./svg-2blbi7adm0";

function IconWrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-[#27272a] content-stretch flex items-center p-[4px] relative rounded-[4px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#3f3f47] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="overflow-clip relative rounded-[4px] shrink-0 size-[20px]" data-name="Icon">
        {children}
      </div>
    </div>
  );
}

function Button1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative">{children}</div>
      </div>
    </div>
  );
}

function Button({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-[#8200db] relative rounded-[8px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#ad46ff] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[4px] items-center justify-center p-[8px] relative">{children}</div>
      </div>
    </div>
  );
}
type BeatGridInstrumentTitlesTextProps = {
  text: string;
};

function BeatGridInstrumentTitlesText({ text }: BeatGridInstrumentTitlesTextProps) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[8px] relative w-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9f9fa9] text-[20px]">{text}</p>
        </div>
      </div>
    </div>
  );
}
type GridItemProps = {
  className?: string;
  gridType?: "Grid Square" | "Track Number";
  style?: "Primary" | "None" | "Secondary";
  trackNumber?: string;
};

function GridItem({ className, gridType = "Grid Square", style = "Primary", trackNumber = "#" }: GridItemProps) {
  const isGridSquareAndIsPrimaryOrSecondary = gridType === "Grid Square" && ["Primary", "Secondary"].includes(style);
  return (
    <div className={className || `relative size-[40px] ${gridType === "Grid Square" && style === "Secondary" ? "bg-[#18181b] overflow-clip rounded-[8px]" : gridType === "Grid Square" && style === "Primary" ? "bg-[#3f3f47] overflow-clip rounded-[8px]" : ""}`}>
      <div className={`size-full ${isGridSquareAndIsPrimaryOrSecondary ? "overflow-clip rounded-[inherit]" : "flex flex-col items-center justify-center"}`}>
        {gridType === "Track Number" && style === "None" && (
          <div className="content-stretch flex flex-col items-center justify-center p-[8px] relative size-full">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#3f3f47] text-[16px]">{trackNumber}</p>
          </div>
        )}
      </div>
      {isGridSquareAndIsPrimaryOrSecondary && <div aria-hidden="true" className="absolute border border-[#4a5565] border-solid inset-0 pointer-events-none rounded-[8px]" />}
    </div>
  );
}
type GridRowsProps = {
  className?: string;
  hasTitle?: boolean;
  instrumentName?: string;
  rowType?: "Title" | "Instrument Row";
  trackTitle?: string;
};

function GridRows({ className, hasTitle = true, instrumentName = "Row Title", rowType = "Title", trackTitle = "Row Title" }: GridRowsProps) {
  const isInstrumentRowAndHasTitle = rowType === "Instrument Row" && hasTitle;
  const isInstrumentRowAndNotHasTitle = rowType === "Instrument Row" && !hasTitle;
  const isNotHasTitleAndIsTitleOrInstrumentRow = !hasTitle && ["Title", "Instrument Row"].includes(rowType);
  const isTitleAndHasTitle = rowType === "Title" && hasTitle;
  const isTitleAndNotHasTitle = rowType === "Title" && !hasTitle;
  return (
    <div className={className || "relative"}>
      <div className="flex flex-row items-center size-full">
        <div className={`content-stretch flex gap-[16px] items-center relative ${isInstrumentRowAndNotHasTitle ? "py-[8px]" : ""}`}>
          {isNotHasTitleAndIsTitleOrInstrumentRow && (
            <>
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#3f3f47] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isTitleAndNotHasTitle ? "None" : undefined} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#18181b] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isInstrumentRowAndNotHasTitle ? "Secondary" : "None"} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#3f3f47] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isTitleAndNotHasTitle ? "None" : undefined} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#18181b] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isInstrumentRowAndNotHasTitle ? "Secondary" : "None"} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#3f3f47] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isTitleAndNotHasTitle ? "None" : undefined} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#18181b] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isInstrumentRowAndNotHasTitle ? "Secondary" : "None"} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#3f3f47] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isTitleAndNotHasTitle ? "None" : undefined} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#18181b] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isInstrumentRowAndNotHasTitle ? "Secondary" : "None"} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#3f3f47] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isTitleAndNotHasTitle ? "None" : undefined} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#18181b] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isInstrumentRowAndNotHasTitle ? "Secondary" : "None"} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#3f3f47] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isTitleAndNotHasTitle ? "None" : undefined} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#18181b] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isInstrumentRowAndNotHasTitle ? "Secondary" : "None"} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#3f3f47] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isTitleAndNotHasTitle ? "None" : undefined} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#18181b] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isInstrumentRowAndNotHasTitle ? "Secondary" : "None"} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#3f3f47] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isTitleAndNotHasTitle ? "None" : undefined} />
              <GridItem className={`relative shrink-0 size-[40px] ${isInstrumentRowAndNotHasTitle ? "bg-[#18181b] rounded-[8px]" : ""}`} gridType={isTitleAndNotHasTitle ? "Track Number" : undefined} style={isInstrumentRowAndNotHasTitle ? "Secondary" : "None"} />
            </>
          )}
          {isTitleAndHasTitle && (
            <>
              <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#f1f5f9] text-[20px]">{trackTitle}</p>
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
              <GridItem className="relative shrink-0 size-[40px]" gridType="Track Number" style="None" />
            </>
          )}
          {isInstrumentRowAndHasTitle && (
            <>
              <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#f1f5f9] text-[20px]">{instrumentName}</p>
              <GridItem className="bg-[#3f3f47] relative rounded-[8px] shrink-0 size-[40px]" />
              <GridItem className="bg-[#18181b] relative rounded-[8px] shrink-0 size-[40px]" style="Secondary" />
              <GridItem className="bg-[#3f3f47] relative rounded-[8px] shrink-0 size-[40px]" />
              <GridItem className="bg-[#18181b] relative rounded-[8px] shrink-0 size-[40px]" style="Secondary" />
              <GridItem className="bg-[#3f3f47] relative rounded-[8px] shrink-0 size-[40px]" />
              <GridItem className="bg-[#18181b] relative rounded-[8px] shrink-0 size-[40px]" style="Secondary" />
              <GridItem className="bg-[#3f3f47] relative rounded-[8px] shrink-0 size-[40px]" />
              <GridItem className="bg-[#18181b] relative rounded-[8px] shrink-0 size-[40px]" style="Secondary" />
              <GridItem className="bg-[#3f3f47] relative rounded-[8px] shrink-0 size-[40px]" />
              <GridItem className="bg-[#18181b] relative rounded-[8px] shrink-0 size-[40px]" style="Secondary" />
              <GridItem className="bg-[#3f3f47] relative rounded-[8px] shrink-0 size-[40px]" />
              <GridItem className="bg-[#18181b] relative rounded-[8px] shrink-0 size-[40px]" style="Secondary" />
              <GridItem className="bg-[#3f3f47] relative rounded-[8px] shrink-0 size-[40px]" />
              <GridItem className="bg-[#18181b] relative rounded-[8px] shrink-0 size-[40px]" style="Secondary" />
              <GridItem className="bg-[#3f3f47] relative rounded-[8px] shrink-0 size-[40px]" />
              <GridItem className="bg-[#18181b] relative rounded-[8px] shrink-0 size-[40px]" style="Secondary" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuperBeatsHome() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative size-full" data-name="SuperBeats Home">
      <div className="bg-[#18181b] relative shrink-0 w-full" data-name="Navbar">
        <div className="flex flex-row items-center justify-end overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex items-center justify-end px-[40px] py-[24px] relative w-full">
            <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="Navbar Actions">
              <Button>
                <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f8fafc] text-[16px]">Sign Up</p>
              </Button>
              <Button1>
                <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f1f5f9] text-[16px]">Log In</p>
              </Button1>
            </div>
            <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#8200db] left-1/2 top-[calc(50%+1px)]" data-name="Logo Container">
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[16px] py-[4px] relative">
                  <p className="font-['Inter:Black_Italic',sans-serif] font-black italic leading-[normal] relative shrink-0 text-[#f8fafc] text-[36px]">Super Beats</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border-[#3f3f47] border-b border-solid inset-0 pointer-events-none" />
      </div>
      <div className="bg-gradient-to-b flex-[1_0_0] from-[#09090b] min-h-px min-w-px relative to-[#18181b] to-[87.258%] w-full" data-name="Main Content">
        <div className="overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex flex-col items-start px-[80px] py-[40px] relative size-full">
            <div className="content-stretch flex flex-col items-start relative shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] shrink-0 w-full" data-name="Beatmaker">
              <div className="bg-[#18181b] relative rounded-tl-[12px] rounded-tr-[12px] shrink-0 w-full" data-name="Playback Tools">
                <div className="overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex items-start justify-between px-[40px] py-[16px] relative w-full">
                    <div className="content-stretch flex gap-[40px] items-center relative shrink-0" data-name="Play Beat Toolbar (left)">
                      <div className="relative shrink-0" data-name="Input Text">
                        <div className="flex flex-row items-center size-full">
                          <div className="content-stretch flex gap-[8px] items-center relative">
                            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#f1f5f9] text-[16px]">{"Tempo"}</p>
                            <div className="bg-[#27272a] content-stretch flex items-center justify-center px-[16px] py-[4px] relative rounded-[2px] shrink-0" data-name="Input">
                              <div aria-hidden="true" className="absolute border border-[#3f3f47] border-solid inset-0 pointer-events-none rounded-[2px]" />
                              <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#f1f5f9] text-[16px]">{"120"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button>
                        <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Icon">
                          <div className="absolute inset-[12.5%]" data-name="Icon">
                            <div className="absolute inset-[-5%]">
                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 16.5">
                                <g id="Icon">
                                  <path d={svgPaths.p3031a300} stroke="var(--stroke-0, #F8FAFC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                                  <path d={svgPaths.p2aad7200} stroke="var(--stroke-0, #F8FAFC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                                </g>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f8fafc] text-[16px]">Playback</p>
                      </Button>
                    </div>
                    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Save Beat Toolbar (right)">
                      <Button1>
                        <IconWrapper>
                          <div className="absolute inset-[18.75%_9.38%]" data-name="Icon">
                            <div className="absolute inset-[-6%_-4.62%]">
                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.75 14">
                                <path d={svgPaths.pb0ea00} id="Icon" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                              </svg>
                            </div>
                          </div>
                        </IconWrapper>
                        <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f1f5f9] text-[16px]">Save Beat</p>
                      </Button1>
                      <Button1>
                        <IconWrapper>
                          <div className="absolute inset-[15.63%_7.68%]" data-name="Icon">
                            <div className="absolute inset-[-5.45%_-4.43%]">
                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.4272 15.25">
                                <path d={svgPaths.p14df6180} id="Icon" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                              </svg>
                            </div>
                          </div>
                        </IconWrapper>
                        <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f1f5f9] text-[16px]">Open Beat</p>
                      </Button1>
                      <Button1>
                        <IconWrapper>
                          <div className="absolute inset-[9.38%_15.63%]" data-name="Icon">
                            <div className="absolute inset-[-4.62%_-5.45%]">
                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.25 17.75">
                                <path d={svgPaths.p2543cf1} id="Icon" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                              </svg>
                            </div>
                          </div>
                        </IconWrapper>
                        <p className="font-['Geist:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#f1f5f9] text-[16px]">New Beat</p>
                      </Button1>
                    </div>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border-2 border-[#3f3f47] border-solid inset-0 pointer-events-none rounded-tl-[12px] rounded-tr-[12px]" />
              </div>
              <div className="bg-[#18181b] relative shrink-0 w-full" data-name="Beat Grid">
                <div className="content-stretch flex flex-col items-center overflow-clip py-[32px] relative rounded-[inherit] w-full">
                  <div className="relative shrink-0" data-name="BeatGrid">
                    <div className="flex flex-row items-center size-full">
                      <div className="content-stretch flex gap-[24px] items-center relative">
                        <div className="flex flex-row items-center self-stretch">
                          <div className="content-stretch flex flex-col gap-[8px] h-full items-start relative shrink-0" data-name="Track Titles">
                            <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Title">
                              <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#3f3f47] text-[20px]">Tracks</p>
                            </div>
                            <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-between min-h-px min-w-px relative" data-name="Instrument Titles">
                              <BeatGridInstrumentTitlesText text="Kick" />
                              <BeatGridInstrumentTitlesText text="Snare" />
                              <BeatGridInstrumentTitlesText text="Open Hi-hat" />
                              <BeatGridInstrumentTitlesText text="Closed Hi-hat" />
                              <BeatGridInstrumentTitlesText text="Clap" />
                            </div>
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0" data-name="Track Grid">
                          <GridRows className="relative shrink-0" hasTitle={false} />
                          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Instrument Grids">
                            <GridRows className="relative shrink-0" hasTitle={false} rowType="Instrument Row" />
                            <GridRows className="relative shrink-0" hasTitle={false} rowType="Instrument Row" />
                            <GridRows className="relative shrink-0" hasTitle={false} rowType="Instrument Row" />
                            <GridRows className="relative shrink-0" hasTitle={false} rowType="Instrument Row" />
                            <GridRows className="relative shrink-0" hasTitle={false} rowType="Instrument Row" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border-[#3f3f47] border-b-2 border-l-2 border-r-2 border-solid inset-0 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}