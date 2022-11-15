import os
import shutil
from subprocess import check_output

ROOT = "C:\\Users\\Jotler\\Documents\\Soulseek Downloads\\complete"


def path(*sub_paths):
    return os.path.join(ROOT, *sub_paths)


def ensure_dir(file_path):
    try:
        os.mkdir(file_path)
    except FileExistsError:
        pass


def move_file(old_file_path, new_file_path):
    shutil.move(old_file_path, new_file_path)


def get_bit_depth(file_path):
    return int(
        check_output(
            " ".join(
                [
                    "ffprobe",
                    '"{file_path}"'.format(file_path=file_path),
                    "-select_streams a:0",
                    "-show_entries stream=bits_per_sample",
                    "-v quiet",
                    '-of csv="p=0"',
                ]
            ),
            shell=True,
        )
        .decode()
        .rstrip()
    )


def get_bit_rate(file_path):
    return int(
        check_output(
            " ".join(
                [
                    "ffprobe",
                    '"{file_path}"'.format(file_path=file_path),
                    "-select_streams a:0",
                    "-show_entries stream=bit_rate",
                    "-v quiet",
                    '-of csv="p=0"',
                ]
            ),
            shell=True,
        )
        .decode()
        .rstrip()[0:-1]
    )


def get_sample_rate(file_path):
    return int(
        check_output(
            " ".join(
                [
                    "ffprobe",
                    '"{file_path}"'.format(file_path=file_path),
                    "-select_streams a:0",
                    "-show_entries stream=sample_rate",
                    "-v quiet",
                    '-of csv="p=0"',
                ]
            ),
            shell=True,
        )
        .decode()
        .rstrip()[0:-1]
    )


def make_cd_ready_wav(input_file_path, output_file_path):
    return (
        check_output(
            " ".join(
                [
                    "ffmpeg -i",
                    '"{file_path}"'.format(file_path=input_file_path),
                    "-ar 44100",
                    "-v quiet",
                    '"{file_path}"'.format(file_path=output_file_path),
                ]
            ),
            shell=True,
        )
        .decode()
        .rstrip()
    )


ensure_dir(path("backup"))

for file_name in os.listdir(ROOT):
    file_path = path(file_name)
    final_file_path = ""

    should_convert = False

    if file_name.endswith(".wav"):
        final_file_path = file_path

        bit_rate = get_bit_rate(file_path)
        bit_depth = get_bit_depth(file_path)

        if bit_depth == 24 or bit_rate > 1411200:
            should_convert = True

    elif file_name.endswith(".flac"):
        final_file_path = file_path[:-5] + ".wav"

        sample_rate = get_sample_rate(file_path)

        if sample_rate >= 96000:
            print(
                'WARNING: "{file_name}" has a sample rate of {sample_rate} hz. You have to find another version!'.format(
                    file_name=file_name, sample_rate=sample_rate
                )
            )
        else:
            should_convert = True

    if should_convert:
        print(
            'Converting "{file_name}" to CD ready .wav...'.format(file_name=file_name)
        )

        backup_file_path = path("backup", file_name)
        move_file(file_path, backup_file_path)

        make_cd_ready_wav(backup_file_path, final_file_path)

_ = input("Done!")
