import { extend, flatMap } from "lodash";

import { getOverlapsOfPotentiallyCircularRanges } from "./getOverlapsOfPotentiallyCircularRanges";
import { splitRangeIntoTwoPartsIfItIsCircular } from "./splitRangeIntoTwoPartsIfItIsCircular";
import { trimNonCicularRangeByAnotherNonCircularRange } from "./trimNonCicularRangeByAnotherNonCircularRange";
import { AnnRange } from "./types";

/**
 * trims range, but does *not* adjust it
 * returns a new range if there is one, or null, if it is trimmed completely
 */
export function trimRangeByAnotherRange(
  rangeToBeTrimmed: AnnRange,
  trimmingRange: AnnRange,
  sequenceLength: number
) {
  //get the overlaps of the ranges
  let overlaps = getOverlapsOfPotentiallyCircularRanges(
    rangeToBeTrimmed,
    trimmingRange,
    sequenceLength
  );
  //split the range to be trimmed into pieces if necessary
  if (!overlaps.length) {
    //just return the range to be trimmed
    return rangeToBeTrimmed;
  }
  //and trim both pieces by the already calculated overlaps
  let splitRangesToBeTrimmed = splitRangeIntoTwoPartsIfItIsCircular(
    rangeToBeTrimmed,
    sequenceLength
  );
  let outputSplitRanges = flatMap(splitRangesToBeTrimmed, function (nonCircularRangeToBeTrimmed) {
    let holder: AnnRange | undefined = nonCircularRangeToBeTrimmed
    overlaps.forEach(function (overlap: AnnRange) {
      if (nonCircularRangeToBeTrimmed) {
        holder = trimNonCicularRangeByAnotherNonCircularRange(
          nonCircularRangeToBeTrimmed,
          overlap
        );
      }
    });
    if (holder) return holder
    else return []
  });
  // //filter out any of the split ranges that have been fully deleted!
  // let outputSplitRanges = splitRangesToBeTrimmed.filter(function (trimmedRange) {
  //   if (trimmedRange) {
  //     return true;
  //   }
  // });

  let outputTrimmedRange: AnnRange | null = null;
  if (outputSplitRanges.length < 0) {
    //do nothing to the output trimmed range
  } else if (outputSplitRanges.length === 1) {
    outputTrimmedRange = outputSplitRanges[0];
  } else if (outputSplitRanges.length === 2) {
    if (outputSplitRanges[0].start < outputSplitRanges[1].start) {
      outputTrimmedRange = {
        start: outputSplitRanges[1].start,
        end: outputSplitRanges[0].end
      };
    } else {
      outputTrimmedRange = {
        start: outputSplitRanges[0].start,
        end: outputSplitRanges[1].end
      };
    }
  }
  if (outputTrimmedRange) {
    return extend({}, rangeToBeTrimmed, {
      start: outputTrimmedRange.start,
      end: outputTrimmedRange.end
    });
  } else {
    return null
  }
};
