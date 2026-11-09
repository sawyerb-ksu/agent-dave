"""Generate the fake scans and scanning log for the scan-renamer workshop kit.

Run it from anywhere to (re)build the starter and finished folders:

    python3 examples/kits/scan-renamer/make_sample_scans.py

It needs Pillow (pip install pillow).

This also resets the kit after a practice run, since the skill renames files
in place. Every file is labeled "SAMPLE - FAKE DATA"; nothing here is real.
"""

from __future__ import annotations

import csv
import shutil
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

KIT_DIR: Path = Path(__file__).resolve().parent
KIT_VARIANTS: tuple[str, ...] = ("starter", "finished")
LOG_NAME: str = "scanning-log.csv"


@dataclass(frozen=True)
class SampleScan:
    """One fake scanned file and its scanning-log entry.

    Attributes:
        file: File name as it sits in the scans/ folder.
        date: Date as a person typed it into the log (formats vary on purpose).
        collection: Collection name from the log.
        title: Item title from the log.
        in_folder: False for a log row whose file was never saved (tests "Missing").
        in_log: False for a file nobody logged (tests "Skip").
    """

    file: str
    date: str
    collection: str
    title: str
    in_folder: bool = True
    in_log: bool = True


# Edge cases are deliberate: mixed date formats, a blank date, a duplicate
# title, an unlogged file, and a logged file that is missing from the folder.
SAMPLES: tuple[SampleScan, ...] = (
    SampleScan("IMG_0042.png", "6/14/1952", "Campus History", "Commencement program cover"),
    SampleScan("IMG_0043.png", "June 1953", "Campus History", "Marching band on the quad"),
    SampleScan("IMG_0044.png", "June 1953", "Campus History", "Marching band on the quad"),
    SampleScan("IMG_0045.png", "June 1953", "Campus History", "Band director portrait", in_folder=False),
    SampleScan("scan (3).pdf", "3/2/1961", "County Fair", "Premium list"),
    SampleScan("scan (4).pdf", "1961", "County Fair", "Livestock judging results"),
    SampleScan("Document_final_FINAL.pdf", "Oct. 30, 1938", "Family Letters", "Letter to sister June"),
    SampleScan("20241105_091233.png", "", "Postcards", "Main Street in winter"),
    SampleScan("New Scan 7.pdf", "May 1, 1975", "Campus History", "Library dedication program"),
    SampleScan("untitled.png", "", "", "Unlabeled photo", in_log=False),
)


class SampleKitBuilder:
    """Writes the scans/ folder and scanning log into one kit variant folder."""

    def __init__(self, variant_dir: Path, samples: tuple[SampleScan, ...] = SAMPLES) -> None:
        """Set up a builder for one kit variant.

        Args:
            variant_dir: Kit variant folder, such as scan-renamer-kit/starter.
            samples: Sample scans to generate.
        """
        self.variant_dir = variant_dir
        self.scans_dir = variant_dir / "scans"
        self.samples = samples
        self.font = ImageFont.load_default(size=28)

    def build(self) -> None:
        """Replace the scans/ folder and log, and remove any old rename-log.md.

        Returns:
            None
        """
        shutil.rmtree(self.scans_dir, ignore_errors=True)
        self.scans_dir.mkdir(parents=True)
        (self.variant_dir / "rename-log.md").unlink(missing_ok=True)

        for sample in self.samples:
            if sample.in_folder:
                self._write_scan(sample)
        self._write_log()

    def _write_scan(self, sample: SampleScan) -> None:
        """Render a placeholder page showing the item's label and save it as PNG or PDF.

        Args:
            sample: The sample scan to render.

        Returns:
            None
        """
        page = Image.new("RGB", (850, 1100), "#f4ecd8")
        draw = ImageDraw.Draw(page)
        lines = ["SAMPLE - FAKE DATA", sample.title, sample.collection, sample.date or "(no date)"]
        for row, text in enumerate(lines):
            draw.text((60, 80 + row * 60), text, fill="#3b2f1e", font=self.font)

        # Pillow picks the format from the extension (.png or .pdf).
        page.save(self.scans_dir / sample.file)

    def _write_log(self) -> None:
        """Write the scanning log CSV for every logged sample.

        Returns:
            None
        """
        with open(self.variant_dir / LOG_NAME, "w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(["file", "date", "collection", "title"])
            for sample in self.samples:
                if sample.in_log:
                    writer.writerow([sample.file, sample.date, sample.collection, sample.title])


if __name__ == "__main__":
    for variant in KIT_VARIANTS:
        SampleKitBuilder(KIT_DIR / variant).build()
    print(f"Rebuilt sample scans in {KIT_DIR}")
