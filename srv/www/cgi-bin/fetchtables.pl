#!/usr/bin/perl -w
use strict;
use warnings;

use CGI;
use DBI;
use JSON;
use Data::Dumper qw(Dumper);
#use DBI qw(:sql_types);

my %hash;
my $hash;
my $json;
my $useacomma;

my $q = new CGI;
print $q->header();



my $dbh = DBI->connect('dbi:Pg:dbname=classic;host=localhost','derek','dtDerek',{AutoCommit=>1,RaiseError=>1,PrintError=>0});

my $sth = $dbh->prepare("SELECT * FROM items WHERE 1=0");
$sth->execute();
my $fields = $sth->{NAME};

print "{\n\"items\" : [\n";
$useacomma = 0;
$sth = $dbh->prepare("SELECT * FROM items");
$sth->execute();

while (my @row = $sth->fetchrow_array) {  # retrieve one row at a time
  @hash{@$fields} = @row;
  $json = encode_json \%hash;
  if ($useacomma) {
    print ",\n";
  } else {
    $useacomma = 1;
  };
  print $json;
}
print "\n],\n\n";






$sth = $dbh->prepare("SELECT * FROM messages") or die +DBI->errstr;
$sth->execute() or die DBI->errstr;
print "\n\"messages\" : ";
delete $hash{$_} for (keys %hash);
while( my( $messageID, $message ) = $sth->fetchrow_array() ) {
  $hash{ $messageID } = $message;
}
$json = encode_json \%hash;
print $json,",\n\n";







$sth = $dbh->prepare("SELECT command, token FROM commands") or die +DBI->errstr;
$sth->execute() or die DBI->errstr;
print "\n\"commands\" : ";
delete $hash{$_} for (keys %hash);
while( my( $command, $token ) = $sth->fetchrow_array() ) {
  $hash{ $command } = $token;
}
$json = encode_json \%hash;
print $json,"\n}\n\n";
