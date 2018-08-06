import codecs
from setuptools import setup
from webssh._version import __version__ as version


with codecs.open('README.md', encoding='utf-8') as f:
    long_description = f.read()


setup(
    name='webssh',
    version=version,
    description='Web based ssh client',
    long_description=long_description,
    author='Yuxiang Ren',
    author_email='mail@yuxiang.ren',
    url='https://github.com/shlyren/webssh',
    packages=['webssh'],
    entry_points='''
    [console_scripts]
    wssh = webssh.main:main
    ''',
    license='MIT',
    include_package_data=True,
    classifiers=[
        'Programming Language :: Python',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
    ],
    install_requires=[
        'tornado>=4.5.0',
        'paramiko>=2.3.1',
    ],
)
